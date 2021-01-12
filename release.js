/* eslint-disable @typescript-eslint/no-var-requires */
'use strict';

const builder = require('electron-builder');
const path = require('path');

const Platform = builder.Platform;

(async () => {
	
	await builder.build({
		targets: Platform.WINDOWS.createTarget(['nsis']),
		publish: "never",
		config: {
			productName: 'bilibili-up',
			appId: 'com.sewerganger.bilibiliup',
			icon: './src/main/icons/win/icon.ico',
			files: [
				'!node_modules',
				'!yarn.lock',
				'!.eslintrc.json',
				'!temp/',
				'!test/',
				'!src/',
				'!release/',
				'!package-lock.json',
				'!webpack.*',
				'!release.js',
				'!.eslintrc',
				'!.eslintignore',
				'!tsconfig.json',
				'!*.md',
				'!**.git/*/',
				'!out/',
				'!.gitignore'
			],

			directories: {
				// buildResources: '/dist/**/*',
				output: path.resolve(__dirname, './out/')
			},
			nsis: {
				runAfterFinish: false,
				perMachine: true,
				allowToChangeInstallationDirectory: true,
				oneClick: false,
				installerIcon: path.resolve(__dirname, './src/main/icons/win/icon.ico'),
				uninstallerIcon: path.resolve(__dirname, './src/main/icons/win/icon.ico'),
				deleteAppDataOnUninstall: true
			},
			asar: false,
			artifactName: '${name}-setup-${version}.${ext}'
		}
	})
		.then((val) => {
			console.log(val);
		})
		.catch((err) => {
			console.log(err);
		});

})();