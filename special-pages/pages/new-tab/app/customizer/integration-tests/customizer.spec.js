import { test } from '@playwright/test';
import { NewtabPage } from '../../../integration-tests/new-tab.page.js';
import { CustomizerPage } from './customizer.page.js';

test.describe('newtab customizer', () => {
    test('loads with the default light background when disabled', async ({ page }, workerInfo) => {
        const ntp = NewtabPage.create(page, workerInfo);
        const cp = new CustomizerPage(ntp);
        await ntp.reducedMotion();
        await ntp.openPage({ additional: { customizerDrawer: 'disabled' } });
        await cp.hasDefaultBackground();
    });
    test('loads with the default dark background when disabled', async ({ page }, workerInfo) => {
        const ntp = NewtabPage.create(page, workerInfo);
        const cp = new CustomizerPage(ntp);
        await ntp.reducedMotion();
        await ntp.darkMode();
        await ntp.openPage({ additional: { customizerDrawer: 'disabled' } });
        await cp.hasDefaultDarkBackground();
    });
    test('Opens automatically from initialSetup settings', async ({ page }, workerInfo) => {
        const ntp = NewtabPage.create(page, workerInfo);
        const cp = new CustomizerPage(ntp);
        await ntp.reducedMotion();
        await ntp.openPage({ additional: { customizerDrawer: 'enabled', autoOpen: 'true' } });
        await cp.closesCustomizer();
    });
    test('Opens automatically from subscription message', async ({ page }, workerInfo) => {
        const ntp = NewtabPage.create(page, workerInfo);
        const cp = new CustomizerPage(ntp);
        await ntp.reducedMotion();
        await ntp.openPage({ additional: { customizerDrawer: 'enabled' } });

        // control
        await cp.opensCustomizer();
        // await page.screenshot({ path: 'abc.png' });
        await cp.closesCustomizer();
        // await page.screenshot({ path: 'abc1.png' });
        await cp.customizerOpensAutomatically();
    });
    test('loads with the default background', async ({ page }, workerInfo) => {
        const ntp = NewtabPage.create(page, workerInfo);
        const cp = new CustomizerPage(ntp);
        await ntp.reducedMotion();
        await ntp.openPage({ additional: { customizerDrawer: 'enabled' } });

        await cp.opensCustomizer();
        await cp.hasDefaultBackgroundSelected();
    });
    test('respects CSS media query for light/dark when browser theme is "system"', async ({ page }, workerInfo) => {
        const ntp = NewtabPage.create(page, workerInfo);
        const cp = new CustomizerPage(ntp);
        await ntp.reducedMotion();

        await ntp.openPage({ additional: { customizerDrawer: 'enabled', theme: 'system' } });
        await cp.opensCustomizer();

        // check the main page + drawer both are light theme
        await cp.mainContentHasTheme('light');
        await cp.drawerHasTheme('light');

        // emulate changing os-level settings to 'dark'
        await ntp.darkMode();

        // now assert the themes updated correctly
        await cp.mainContentHasTheme('dark');
        await cp.drawerHasTheme('dark');
    });
    test('loads with the default background and accepts background update', async ({ page }, workerInfo) => {
        const ntp = NewtabPage.create(page, workerInfo);
        const cp = new CustomizerPage(ntp);
        await ntp.reducedMotion();
        await ntp.openPage({ additional: { customizerDrawer: 'enabled' } });

        await cp.hasDefaultBackground();
        await cp.opensCustomizer();
        await cp.hasDefaultBackgroundSelected();

        await cp.acceptsBackgroundUpdate({
            kind: 'color',
            value: 'color01',
        });
        await cp.hasColorBackground('color01');
    });
    test('loads with the default background and accepts theme update', async ({ page }, workerInfo) => {
        const ntp = NewtabPage.create(page, workerInfo);
        const cp = new CustomizerPage(ntp);
        await ntp.reducedMotion();
        await ntp.openPage({ additional: { customizerDrawer: 'enabled' } });

        await cp.opensCustomizer();
        await cp.hasDefaultBackgroundSelected();

        // this is a control, to ensure it's light before we deliver an update
        await cp.hasContentTheme('light');

        // now deliver the update and ensure it changed
        await cp.acceptsThemeUpdate('dark');
        await cp.hasContentTheme('dark');
    });
    test('loads with a color background', async ({ page }, workerInfo) => {
        const ntp = NewtabPage.create(page, workerInfo);
        const cp = new CustomizerPage(ntp);
        await ntp.reducedMotion();
        await ntp.openPage({ additional: { customizerDrawer: 'enabled', background: 'color01', theme: 'dark' } });
        await cp.opensCustomizer();
        await cp.hasColorSelected();
        await cp.acceptsThemeUpdate('light');
    });
    test('loads with a color background, and sets back to default', async ({ page }, workerInfo) => {
        const ntp = NewtabPage.create(page, workerInfo);
        const cp = new CustomizerPage(ntp);
        await ntp.reducedMotion();
        await ntp.openPage({ additional: { customizerDrawer: 'enabled', background: 'color01' } });
        await cp.opensCustomizer();
        await cp.hasColorSelected();
        await cp.selectsDefault();
    });
    test('loads with default background, and sets a color', async ({ page }, workerInfo) => {
        const ntp = NewtabPage.create(page, workerInfo);
        const cp = new CustomizerPage(ntp);
        await ntp.reducedMotion();
        await ntp.openPage({ additional: { customizerDrawer: 'enabled' } });
        await cp.opensCustomizer();
        await cp.hasDefaultBackgroundSelected();
        const back = await cp.selectsColor();
        await back();
        await cp.hasColorSelected();
    });
    test('loads with default background, and uses color picker', async ({ page }, workerInfo) => {
        const ntp = NewtabPage.create(page, workerInfo);
        const cp = new CustomizerPage(ntp);
        await ntp.reducedMotion();
        await ntp.openPage({ additional: { customizerDrawer: 'enabled', background: 'default' } });
        await cp.opensCustomizer();
        await cp.hasDefaultBackgroundSelected();
        await cp.showsColorSelectionPanel();

        await cp.selectsCustomColor('#cacaca');
        await cp.savesTheCustomColor('#cacaca');
    });
    test('loads with default background and accepts a color update', async ({ page }, workerInfo) => {
        const ntp = NewtabPage.create(page, workerInfo);
        const cp = new CustomizerPage(ntp);
        await ntp.reducedMotion();
        await ntp.openPage({ additional: { customizerDrawer: 'enabled', background: 'default' } });
        await cp.opensCustomizer();
        await cp.hasDefaultBackgroundSelected();
        await cp.showsColorSelectionPanel();

        await test.step('when a color update is received', async () => {
            await cp.hasCustomColorValue('#ffffff');
            await cp.acceptsColorUpdate('#cacaca');
        });

        await test.step('then the custom color panel should reflect the color', async () => {
            await cp.hasCustomColorValue('#cacaca');
        });
    });
    test('switches from selected predefined color, to a previously selected hex value', async ({ page }, workerInfo) => {
        const ntp = NewtabPage.create(page, workerInfo);
        const cp = new CustomizerPage(ntp);
        await ntp.reducedMotion();
        await ntp.openPage({ additional: { customizerDrawer: 'enabled', background: 'color01', userColor: 'cacaca' } });
        await cp.opensCustomizer();
        await cp.hasColorSelected();
        await cp.selectsPreviousCustomColor('#cacaca');
        await cp.savesTheCustomColor('#cacaca');
    });
    test('loads with default background, and sets a gradient', async ({ page }, workerInfo) => {
        const ntp = NewtabPage.create(page, workerInfo);
        const cp = new CustomizerPage(ntp);
        await ntp.reducedMotion();
        await ntp.openPage({ additional: { customizerDrawer: 'enabled' } });
        await cp.opensCustomizer();
        await cp.hasDefaultBackgroundSelected();
        const back = await cp.selectsGradient();
        await back();
        await cp.hasGradientSelected();
    });
    test('loads with a gradient background', async ({ page }, workerInfo) => {
        const ntp = NewtabPage.create(page, workerInfo);
        const cp = new CustomizerPage(ntp);
        await ntp.reducedMotion();
        await ntp.openPage({ additional: { customizerDrawer: 'enabled', background: 'gradient02' } });
        await cp.opensCustomizer();
        await cp.hasGradientSelected();
    });
    test('loads with a user image', async ({ page }, workerInfo) => {
        const ntp = NewtabPage.create(page, workerInfo);
        const cp = new CustomizerPage(ntp);
        await ntp.reducedMotion();
        await ntp.openPage({ additional: { customizerDrawer: 'enabled', background: 'userImage:01', userImages: 'true' } });
        await cp.opensCustomizer();
        await cp.hasImagesSelected();
    });
    test('loads without images, and then accepts 1', async ({ page }, workerInfo) => {
        const ntp = NewtabPage.create(page, workerInfo);
        const cp = new CustomizerPage(ntp);
        await ntp.reducedMotion();
        await ntp.openPage({ additional: { customizerDrawer: 'enabled' } });
        await cp.opensCustomizer();
        await cp.hasEmptyImagesPanel();
        await cp.acceptsImagesUpdate();
    });
    test.skip('loads without images, and handles root-level exceptions', async ({ page }, workerInfo) => {
        const ntp = NewtabPage.create(page, workerInfo);
        const cp = new CustomizerPage(ntp);
        await ntp.reducedMotion();
        await ntp.openPage({ additional: { customizerDrawer: 'enabled' } });
        await cp.opensCustomizer();
        await cp.hasEmptyImagesPanel();
        await cp.acceptsBadImagesUpdate();
        await cp.closesCustomizer();
    });
    test.skip('loads with images, and handles nested exceptions', async ({ page }, workerInfo) => {
        const ntp = NewtabPage.create(page, workerInfo);
        const cp = new CustomizerPage(ntp);
        await ntp.reducedMotion();
        await ntp.openPage({ additional: { customizerDrawer: 'enabled', userImages: 'true', willThrowPageException: 'userImages' } });
        await cp.opensCustomizer();
        await cp.opensImages();
        await cp.handlesNestedException();
    });
    test('trigger file upload', async ({ page }, workerInfo) => {
        const ntp = NewtabPage.create(page, workerInfo);
        const cp = new CustomizerPage(ntp);
        await ntp.reducedMotion();
        await ntp.openPage({ additional: { customizerDrawer: 'enabled' } });
        await cp.opensCustomizer();
        await cp.uploadsFirstImage();
    });
    test.skip('trigger additional file uploads', async ({ page }, workerInfo) => {
        const ntp = NewtabPage.create(page, workerInfo);
        const cp = new CustomizerPage(ntp);
        await ntp.reducedMotion();
        await ntp.openPage({ additional: { customizerDrawer: 'enabled', userImages: 'true' } });
        await cp.opensCustomizer();
        await cp.opensImages();
        await cp.uploadsAdditional({ existing: 3 });
    });
    test('Sets theme', async ({ page }, workerInfo) => {
        const ntp = NewtabPage.create(page, workerInfo);
        const cp = new CustomizerPage(ntp);
        await ntp.reducedMotion();
        await ntp.openPage({ additional: { customizerDrawer: 'enabled', theme: 'light' } });
        await cp.opensCustomizer();
        await cp.lightThemeIsSelected();
        await cp.setsDarkTheme();
        await cp.darkThemeIsSelected();
    });
    test.skip('opening settings', async ({ page }, workerInfo) => {
        const ntp = NewtabPage.create(page, workerInfo);
        const cp = new CustomizerPage(ntp);
        await ntp.reducedMotion();
        await ntp.openPage({ additional: { customizerDrawer: 'enabled', theme: 'light' } });
        await cp.opensCustomizer();
        await cp.opensSettings();
    });
});
