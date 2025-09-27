import dotenv from "dotenv";
dotenv.config({
  quiet: true,
});
import { FastMCP } from "fastmcp";
import { VERSION } from "./version";
import { z } from "zod";
import { createDAVClient } from "tsdav";
import ICAL from "ical.js";
import { v4 } from "uuid";

function normalizeValue(value: any) {
  if (value && typeof value.toJSDate === "function") {
    return value.toJSDate().toISOString();
  }
  return value;
}

const server = new FastMCP({
  name: "CalDAV MCP",
  version: VERSION,
  authenticate: async (request) => {
    if (!process.env.API_KEY || !request) {
      return { id: "user" };
    }
    const apiKey = request.headers["authorization"]?.replace("Bearer ", "");
    if (apiKey !== process.env.API_KEY) {
      throw new Response(null, {
        status: 401,
        statusText: "Unauthorized",
      });
    }
    return {
      id: "user",
    };
  },
});

if (!!process.env.CALDAV_URL) {
  const calDavClient = await createDAVClient({
    serverUrl: process.env.CALDAV_URL,
    credentials: {
      username: process.env.USERNAME || "",
      password: process.env.PASSWORD || "",
    },
    authMethod: "Basic",
    defaultAccountType: "caldav",
  });

  server.addTool({
    description: "Lists calendars",
    name: "list_calendars",
    parameters: z.object({}),
    execute: async () => {
      return JSON.stringify(
        (await calDavClient.fetchCalendars()).map((c) => ({
          name: c.displayName,
          url: c.url,
          color: c.calendarColor,
          description: c.description,
          timezone: c.timezone,
        }))
      );
    },
  });

  server.addTool({
    description:
      "Fetches events in a calendar. Supports time range filtering, optionally.",
    name: "fetch_events_from_calendar",
    parameters: z.object({
      startDate: z.string().describe("Start date in ISO format").optional(),
      endDate: z.string().describe("End date in ISO format").optional(),
      calendarName: z
        .string()
        .describe("Name of the calendar to fetch events from"),
    }),
    execute: async (args) => {
      const calendar = await calDavClient
        .fetchCalendars()
        .then((calendars) =>
          calendars.find(
            (c) =>
              c.displayName &&
              c.displayName.toString().toLowerCase() ===
                args.calendarName.toLowerCase()
          )
        );
      const results = (
        await calDavClient.fetchCalendarObjects({
          calendar: calendar!,
          timeRange: (args.startDate && args.endDate
            ? {
                start: args.startDate!,
                end: args.endDate!,
              }
            : undefined) as any,
        })
      ).map((o) => {
        let parsed: any;

        if (o.data && o.data.length > 0) {
          const component = new ICAL.Component(
            ICAL.parse(o.data)
          ).getFirstSubcomponent("vevent");
          if (component) {
            parsed = {};
            component.getAllProperties().forEach((p) => {
              if (p.name.toLowerCase() === "x-apple-structured-data") {
                return;
              }
              parsed[p.name] =
                p.getValues().length === 1
                  ? normalizeValue(p.getValues()[0])
                  : p.getValues().map((x) => normalizeValue(x));
            });
          }
        }
        return {
          etag: o.etag,
          url: o.url,
          data: parsed,
        };
      });

      return JSON.stringify(results);
    },
  });

  server.addTool({
    description: "Add or update calendar event",
    name: "add_or_update_calendar_event",
    parameters: z.object({
      startDate: z.string().describe("Start date in ISO format"),
      endDate: z.string().describe("End date in ISO format"),
      calendarName: z
        .string()
        .describe("Name of the calendar to create/update event in"),
      description: z.string().describe("Description of the event").optional(),
      summary: z.string().describe("Summary of the event"),
      eventUid: z
        .string()
        .describe("UID of the event in the case this is an update")
        .optional(),
      location: z.string().describe("Location of the event").optional(),
    }),
    execute: async (args) => {
      const calendar = await calDavClient
        .fetchCalendars()
        .then((calendars) =>
          calendars.find(
            (c) =>
              c.displayName &&
              c.displayName.toString().toLowerCase() ===
                args.calendarName.toLowerCase()
          )
        );
      let uuid: string;
      if (args.eventUid) {
        uuid = args.eventUid!;
      } else {
        uuid = v4().toString();
      }
      const icalString = "";

      if (args.eventUid) {
        const foundEvent = await calDavClient.fetchCalendarObjects({
          calendar: calendar!,
          filters: {
            uid: args.eventUid,
          },
        });
        if (foundEvent.length > 0) {
          // update
          const event = foundEvent[0];
          event!.data = icalString;
          await calDavClient.updateCalendarObject({
            calendarObject: event!,
          });
        }
      } else {
        // create
        await calDavClient.createCalendarObject({
          calendar: calendar!,
          iCalString: icalString,
          filename: uuid + ".ics",
        });
      }

      return JSON.stringify({ success: true, uuid: uuid });
    },
  });
}

let transport: "httpStream" | "stdio" = "httpStream";
if (process.env.TRANSPORT === "stdio") {
  transport = "stdio";
}
if (process.argv[2] === "--stdio") {
  transport = "stdio";
}
server.start({
  transportType: transport,
  httpStream: {
    port: 8080,
  },
});
