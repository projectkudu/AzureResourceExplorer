import { ResourceExplorer.ClientPage } from './app.po';

describe('resource-explorer.client App', () => {
  let page: ResourceExplorer.ClientPage;

  beforeEach(() => {
    page = new ResourceExplorer.ClientPage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to app!');
  });
});
