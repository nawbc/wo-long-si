import './index.css';
import './preset.css';
import got from 'got';
import { remote } from 'electron';
import tinycolor from 'tinycolor2';
import cookie from 'cookie';
import { BgColorProp } from './interface';

const eleDragHolder = document.querySelector('.drag-holder') as HTMLElement;
const eleStage = document.querySelector('.stage') as HTMLElement;
const eleColorInput = document.querySelector('.color-picker input') as HTMLElement;
const eleUserBase = document.querySelector('.user-base') as HTMLElement;

const BILIBILI_API = 'https://api.bilibili.com';

const mainWindow = remote.getCurrentWindow();

const createLoginWindow = (): Promise<string> => new Promise((resolve, reject) => {
  try {
    const mainWindow = new remote.BrowserWindow({
      maximizable: true,
      webPreferences: {
        nodeIntegration: true,
        nodeIntegrationInWorker: true,
        enableRemoteModule: true,
      }
    });
    mainWindow.loadURL('https://passport.bilibili.com/login?gourl=https://space.bilibili.com');
    mainWindow.on('close', async () => {
      const val: string = await mainWindow.webContents.executeJavaScript('document.cookie');
      localStorage.setItem('bilibiliCookie', val);

      resolve(val);
    })
  } catch (e) {
    reject(e);
  }
});


const reqApi = got.extend({
  prefixUrl: BILIBILI_API,
  responseType: 'json',
  hooks: {
    beforeRequest: [
      options => {
        const cookie = localStorage.getItem('bilibiliCookie');
        console.log(options);
        if (cookie) {
          options.headers['Cookie'] = cookie;
          options.headers['Referer'] = 'https://www.bilibili.com/';
        } else {
          alert('先登录');
        }
      }
    ]
  }
})


const setBgColor = function (bar: string, stage: string) {
  eleDragHolder.style.backgroundColor = bar;
  eleStage.style.backgroundColor = stage;
}

const initBgColor = function () {
  const color = localStorage.getItem('bgColor');
  console.log(color);
  if (color) {
    const { dragBarColor, stageColor } = JSON.parse(color) as BgColorProp;
    setBgColor(dragBarColor, stageColor);
  } else {
    setBgColor('#0bb6f046', '#73c8e54f');
  }
}



const initElementsEvent = function () {
  eleStage.addEventListener('mouseenter', () => {
    mainWindow.setIgnoreMouseEvents(true, { forward: true })
  })

  eleStage.addEventListener('mouseleave', () => {
    mainWindow.setIgnoreMouseEvents(false)
  })

  eleColorInput.addEventListener('input', (e: any) => {
    const color = tinycolor(e.target.value);
    color.setAlpha(0.6);
    eleDragHolder.style.backgroundColor = color.toRgbString();
    color.setAlpha(0.3);
    eleStage.style.backgroundColor = color.toRgbString();
    localStorage.setItem('bgColor', JSON.stringify({
      dragBarColor: eleDragHolder.style.backgroundColor,
      stageColor: eleStage.style.backgroundColor,
    }));
  });
}

const reqUserCard = async function (id: string): Promise<Record<string, any>> {
  const res = await reqApi.get('x/web-interface/card', {
    searchParams: {
      'mid': id
    }
  });
  return res.body as any;
}

const renderUserBase = function (info: Record<string, any>) {
  eleUserBase.innerHTML = `
      <img src='${info.card.face}'>
      <div>${info.card.name}</div>
    `;
}

const initApp = async function () {
  initBgColor();
  initElementsEvent();
  const bc = localStorage.getItem('bilibiliCookie');
  let bilibiliCookie;
  if (bc) {
    bilibiliCookie = cookie.parse(bc);
  } else {
    const cookieString = await createLoginWindow();
    bilibiliCookie = cookie.parse(cookieString);
  }
  const res = await reqUserCard(bilibiliCookie.DedeUserID);
  if (res?.data) {
    const info = res.data;
    renderUserBase(info);
  } else {
    alert('出错');
  }

}


initApp();
