import './index.css';
import './preset.css';
import got from 'got';
import { remote } from 'electron';
import tinycolor from 'tinycolor2';
import { VideoProp } from './interface';
import open from 'open';

declare const SETTING_WINDOW_WEBPACK_ENTRY: any;

const eleDragHolder = document.querySelector('.drag-holder') as HTMLElement;
const eleStage = document.querySelector('.stage') as HTMLElement;
const eleColorInput = document.querySelector('.color-picker input') as HTMLElement;
const eleUserBase = document.querySelector('.user-base') as HTMLElement;
const eleLocker = document.querySelector('.action-locker') as HTMLElement;
const eleSetting = document.querySelector('.icon-setting') as HTMLElement;
// const eleBasicInfoWrapper = document.querySelector('.basic-info-wrapper') as HTMLElement;
const eleVideoList = document.querySelector('.video-list') as HTMLElement;
const eleClose = document.querySelector('.icon-close') as HTMLElement;
const BILIBILI_API = 'https://api.bilibili.com';

const mainWindow = remote.getCurrentWindow();

// const createLoginWindow = (): Promise<string> => new Promise((resolve, reject) => {
//   try {
//     const mainWindow = new remote.BrowserWindow();
//     mainWindow.loadURL('https://passport.bilibili.com/login?gourl=https://space.bilibili.com');
//     mainWindow.on('close', async () => {
//       const cookies = await remote.session.defaultSession.cookies.get({url: 'https://space.bilibili.com'});
//       const cookieString = cookies.map((val) => `${val.name}=${val.value}`).join(';')
//       localStorage.setItem('bilibiliCookie', cookieString);
//       resolve(cookieString); 
//     })
//   } catch (e) {
//     reject(e);
//   }
// });

const reqApi = got.extend({
  prefixUrl: BILIBILI_API,
  responseType: 'json',
  hooks: {
    beforeRequest: [
      options => {
        options.headers['Referer'] = 'https://www.bilibili.com/';
        options.headers['User-Agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.141 Safari/537.36';
        options.headers['Connection'] = 'keep-alive';
        options.headers['Origin'] = 'https://message.bilibili.com';
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

const setTheme = function () {  
  const { dragBarColor, stageColor, videoItemColor , fontColor} = localStorage;
  if (dragBarColor && stageColor && videoItemColor) {
    setBgColor(dragBarColor, stageColor, videoItemColor);
  } else {
    setBgColor('rgba(0, 0, 0, 0.6)', 'rgba(0, 0, 0, 0.4)', 'rgba(0, 0, 0, 0.24)');
  }

  document.documentElement.style.color = fontColor ?? '#ffffff';
}


const changeBgColor = function (value: string) { 
  const color = tinycolor(value);
  const tmp = parseFloat(localStorage.getItem('bgOpacity'));
  const eleVideoItems = document.querySelectorAll('.video-item')  as NodeListOf<HTMLElement>;
  const op = tmp ? tmp : 0.4;
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

  localStorage.setItem('dragBarColor', eleDragHolder.style.backgroundColor);
  localStorage.setItem('stageColor', eleStage.style.backgroundColor);
  localStorage.setItem('videoItemColor', color.toRgbString());
}

const initWindow = function () { 
  const { windowSize, windowPos } = localStorage;
  if (windowSize) {
    const [w, h] = windowSize.split(',');
    mainWindow.setSize(parseFloat(w), parseFloat(h));
  } else { 
    mainWindow.setSize(308, 268);
  }

  if (windowPos) {
    const [x, y] = windowPos.split(',');
    mainWindow.setPosition(parseFloat(x), parseFloat(y));
  }
}

const initElementsEvent = function () {
  
  mainWindow.on('move', () => {
    localStorage.setItem('windowPos', mainWindow.getPosition().join(','));
  });
  
  mainWindow.on('resize', () => {
    localStorage.setItem('windowSize', mainWindow.getSize().join(','));
  });

  eleStage.addEventListener('mouseenter', () => {
    eleLocker.classList.contains('icon-locker') && mainWindow.setIgnoreMouseEvents(true, { forward: true })
  })

  eleStage.addEventListener('mouseleave', () => {
    eleLocker.classList.contains('icon-locker') && mainWindow.setIgnoreMouseEvents(false)
  })

  eleColorInput.addEventListener('input', (e: any) => {
    changeBgColor(e.target.value);
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
    settingWindow.on('close', (e) => {
      setTheme();
      changeBgColor(eleStage.style.backgroundColor);
    });
  });

  eleClose.addEventListener('click', () => {
    remote.app.exit(0);
  });
}

const reqUserCard = async function (id: string): Promise<Record<string, any>> {
  const res = await reqApi.get('x/space/acc/info', {
    searchParams: {
      mid: id
    }
  });
  return res.body as any;
}

const reqUserSpace = async function (id: string): Promise<Record<string, any>> {
  const res = await reqApi.get('x/space/arc/search', {
    searchParams: {
      'mid': id,
      'pn': 1,
      'ps': 100,
    },
    headers: {
      'Referer': 'https://space.bilibili.com/'
    }
  });

  return res.body as any;
}

const renderUserBasicInfo = async function () {
  
  const resUserInfo = await reqUserCard('258457966');

  if (resUserInfo?.data) {
    const info = resUserInfo?.data;
    eleUserBase.innerHTML = `
        <img src='${info.face}'>
        <div>${info.name}</div>
      `;
  }
}

const renderUserVideos = async function (id: string) {
  const resUserSpace = await reqUserSpace(id);
  const info = resUserSpace?.data;
  if (info) {
    eleVideoList.innerHTML =  info?.list?.vlist.map((data:VideoProp) => {
      return renderVideoItem(data);
    }).join('<br>') + '<div style="height: 80px"/>';
    const eleVideoItems = document.querySelectorAll('.video-item') as NodeListOf<HTMLElement>;
    eleVideoItems.forEach((ele) => {
      ele.addEventListener('click', async (e: any) => { 
        const item: HTMLElement = e.path.find((ele: HTMLElement) => { return ele.className === 'video-item' });
        await open(item.dataset.url);
      })
    }, true);
  } else { 
    alert('视频出错');
  }
}


const clickVideo = function (e: any) { 
  console.log(1111);
}

const renderVideoItem = function (data: VideoProp) { 
  return `
    <div class="video-item" data-url="https://www.bilibili.com/video/${data.bvid}">
      <div 
        class="video-cover"
        style="background-image: url(https:${data.pic})"
      >
      </div>
      <div class="video-content">
        <div class="video-name">${data.title}</div>
        <div class="video-info">
          <div>播放: ${data.play}</div>
          <div>评论: ${data.comment}</div>
          <div>弹幕: ${data.video_review}</div>
        </div>
        <div class="video-info">
          <div>时长: ${data.length}</div>
        </div>
        <div
          class="create-time"
        >${new Date(data.created * 1000).toLocaleString()}</div>
      </div>
    </div>
  `
}

const main = async function () {
  try {
    initElementsEvent();
    initWindow();
    const {  refreshInterval = 10  } = localStorage;
    await renderUserBasicInfo();
    await renderUserVideos('258457966');
    setTheme();

    setInterval(async () => {
      await renderUserVideos('258457966');
      setTheme();
    }, refreshInterval  * 1000);
  } catch (e) { 
    alert(e);
  }
}


main();
