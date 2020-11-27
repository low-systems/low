import * as FS from 'fs';

import { PdfDoer, PdfTaskConfig } from './pdf-doer';
import { ConnectorContext, Environment, TaskConfig } from 'low';
//import { TFontDictionary, TDocumentDefinitions } from 'pdfmake/interfaces';
jest.setTimeout(60000);

test('should be true', async () => {

  const [doer, env] = await setupEnvironment();
  const context = createEmptyContext(env);

  const config: PdfTaskConfig = {
    images: [ 'https://picsum.photos/200/300' ],
    definition: {
      content: [
        {
          text: 'Here is some text'
        },
        {
          image: 'https://picsum.photos/200/300',
          height: 200,
          width: 300
        }
      ],
      defaultStyle: { font: 'Helvetica' }
    },
    headerFunction: 'return [ { text: `Header - page ${currentPage} of ${pageCount}` } ]',
    footerFunction: 'return [ { text: `Footer - page ${currentPage} of ${pageCount}` } ]'
  }

  const pdfBuffer = await doer.main(context, wrapCoreConfig(config), config);
  FS.writeFileSync('test.pdf', pdfBuffer);
});


async function setupEnvironment(): Promise<[PdfDoer, Environment]> {
  const doer = new PdfDoer();
  process.env.SECRETS = JSON.stringify({});
  const env = new Environment({ doers: [doer] }, [], {
    modules: {
      PdfDoer: { }
    }
  });
  await env.init();

  return [doer, env];
}


function createEmptyContext(env: Environment): ConnectorContext<any> {
  return {
    data: {},
    errors: {},
    calls: {},
    connector: {
      input: {},
      config: {}
    },
    env: env
  };
}

function wrapCoreConfig(coreConfig: PdfTaskConfig, name = 'task_1', ): TaskConfig {
  return {
    name: 'task',
    doer: 'PdfDoer',
    config: coreConfig,
    metadata: {}
  };
}