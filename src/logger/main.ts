import { log } from '@/deps/main.ts';

log.setup({
  handlers: {
    default: new log.ConsoleHandler('DEBUG', {
      formatter: (record) =>
        `${record.datetime.toISOString()}  ${record.levelName} --- [${Deno.env
          .get('APP_NAME')!}] : ${record.msg}`,
      useColors: false,
    }),
  },
  loggers: {
    default: {
      level: 'DEBUG',
      handlers: ['default'],
    },
  },
});

export default log;
