import './index.css';
import './preset.css';
import got from 'got';
import { remote } from 'electron';
import tinycolor from 'tinycolor2';
import { BgColorProp } from './interface';
import cookie from 'cookie';

declare const SETTING_WINDOW_WEBPACK_ENTRY: any;

const eleDragHolder = document.querySelector('.drag-holder') as HTMLElement;
const eleStage = document.querySelector('.stage') as HTMLElement;
const eleColorInput = document.querySelector('.color-picker input') as HTMLElement;
const eleUserBase = document.querySelector('.user-base') as HTMLElement;
const eleLocker = document.querySelector('.action-locker') as HTMLElement;
const eleSetting = document.querySelector('.icon-setting') as HTMLElement;
const eleBasicInfoWrapper = document.querySelector('.basic-info-wrapper') as HTMLElement;
const eleVideoList = document.querySelector('.video-list') as HTMLElement;
const BILIBILI_API = 'https://api.bilibili.com';

const mainWindow = remote.getCurrentWindow();

const createLoginWindow = (): Promise<string> => new Promise((resolve, reject) => {
  try {
    const mainWindow = new remote.BrowserWindow();
    mainWindow.loadURL('https://passport.bilibili.com/login?gourl=https://space.bilibili.com');
    mainWindow.on('close', async () => {
      const val: string = await mainWindow.webContents.executeJavaScript('document.cookie');
      localStorage.setItem('bilibiliCookie', val);
      console.log(val);
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


const setBgColor = function (bar: string, stage: string, item: string) {
  const eleVideoItems = document.querySelectorAll('.video-item') as NodeListOf<HTMLElement>;
  eleVideoItems.forEach((ele) => {
    ele.style.backgroundColor = item;
  });
  eleDragHolder.style.backgroundColor = bar;
  eleStage.style.backgroundColor = stage;
}

const initTheme = function () {
  const color = localStorage.getItem('bgColor');
  
  if (color) {
    const { dragBarColor, stageColor, videoItemColor } = JSON.parse(color) as BgColorProp;
    setBgColor(dragBarColor, stageColor, videoItemColor);
  } else {
    setBgColor('rgba(0, 0, 0, 0.6)', 'rgba(0, 0, 0, 0.4)', 'rgba(0, 0, 0, 0.24)');
  }
}


const initElementsEvent = function () {

  eleStage.addEventListener('mouseenter', () => {
    eleLocker.classList.contains('icon-locker') && mainWindow.setIgnoreMouseEvents(true, { forward: true })
  })

  eleStage.addEventListener('mouseleave', () => {
    eleLocker.classList.contains('icon-locker') && mainWindow.setIgnoreMouseEvents(false)
  })

  eleColorInput.addEventListener('input', (e: any) => {
    const color = tinycolor(e.target.value);
    const tmp = parseFloat(localStorage.getItem('bg-opacity'));
    const eleVideoItems = document.querySelectorAll('.video-item')  as NodeListOf<HTMLElement>;
    const op = tmp ?  tmp : 0.4;
    color.setAlpha(0.6);
    eleDragHolder.style.backgroundColor = color.toRgbString();
    color.setAlpha(op);
    eleStage.style.backgroundColor = color.toRgbString();
    if (eleVideoItems) { 
      color.setAlpha(op * 0.6);
      eleVideoItems.forEach((ele) => {
        ele.style.backgroundColor = color.toRgbString();
      });
    }
    localStorage.setItem('bgColor', JSON.stringify({
      dragBarColor: eleDragHolder.style.backgroundColor,
      stageColor: eleStage.style.backgroundColor,
      videoItemColor: color.toRgbString(),
    }));
  });

  eleLocker.addEventListener('click', () => {
    const isLocker = eleLocker.classList.contains('icon-locker');
    if (isLocker) {
      eleLocker.classList.remove('icon-locker');
      eleLocker.classList.add('icon-open-locker');
      mainWindow.setMovable(true);
    } else { 
      eleLocker.classList.remove('icon-open-locker');
      eleLocker.classList.add('icon-locker');
      mainWindow.setMovable(false);
    }
  });

  eleSetting.addEventListener('click', () => {
    const settingWindow = new remote.BrowserWindow();
    settingWindow.loadURL(SETTING_WINDOW_WEBPACK_ENTRY);
    // settingWindow.setMenu(null);
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

const reqUserSpace = async function (id: string): Promise<Record<string, any>> {
  const res = await reqApi.get('x/space/arc/search', {
    searchParams: {
      'mid': id
    }
  });
  return res.body as any;
}

const renderUserBasicInfo = async function (id: string) {
  
  const resUserInfo = await reqUserCard(id);

  if (resUserInfo?.data) {
    const info = resUserInfo?.data;
    eleUserBase.innerHTML = `
        <img src='${info.card.face}'>
        <div>${info.card.name}</div>
      `;
    
    eleBasicInfoWrapper.innerHTML = `
      <div class="icon bilibili"></div>
      <div>
        <div class="level">
          等级: <span>Lv${info.card.level_info.current_level}</span>
        </div>
        <div style="height:5px"></div>
        <div>
          粉丝: ${info.card.fans}
        </div>
        <div style="height:5px"></div>
        <div>
          关注: ${info.card.attention}
        </div>
      </div>
    `;
  } else {
    alert('出错');
  }
}

interface VideoProp { 
  video_review: number;
  pic: string;
  title: string;
  play: string;
  comment: number;
}

const renderUserVideos = async function (id: string) {
  const resUserSpace = await reqUserSpace(id);
  const info = resUserSpace?.data;
  if (info) {
    eleVideoList.innerHTML =  info?.list?.vlist.map((data:VideoProp) => {
      return renderVideoItem(data);
    }).join('<br>') + '<div style="height: 80px"/>';
  } else { 
    alert('出错');
  }
}

const renderVideoItem = function (data: VideoProp) { 
  return `
    <div class="video-item">
      <div 
        class="video-cover"
        style="background-image: url(${data.pic})"
      >
      </div>
      <div class="video-content">
        <div class="video-name">${data.title}</div>
        <div class="video-info">
          <div>播放: ${data.play}</div>
          <div>评论: ${data.comment}</div>
          <div>弹幕: ${data.video_review}</div>
        </div>
      </div>
    </div>
  `
}

const main = async function () {
  initElementsEvent();
  const bc = localStorage.getItem('bilibiliCookie');
  let bilibiliCookie;
  if (bc) {
    bilibiliCookie = cookie.parse(bc);
  } else {
    const cookieString = await createLoginWindow();
    bilibiliCookie = cookie.parse(cookieString);
  }

  console.log(bilibiliCookie);
  
  await renderUserBasicInfo(bilibiliCookie.DedeUserID);
  await renderUserVideos(bilibiliCookie.DedeUserID);
  initTheme();
}


main();
