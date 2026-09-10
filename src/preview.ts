import explainCss from './styles/explain.css?inline';
import noiseCss from './styles/noise.css?inline';
import { settingsNoiseFormulaHtml, mountNoiseTestPane, mountTastePane } from './settings-panes';
import { restoreSettingsIfNeeded } from './config';

restoreSettingsIfNeeded();

const pageCss = `
html, body { margin: 0; min-height: 100%; background: #eef0f3; font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif; color: #1d1d1f; }
.preview-page { max-width: 1180px; margin: 0 auto; padding: 28px 20px 64px; }
.preview-page h1 { margin: 0 0 8px; font-size: 26px; }
.preview-page .lead { margin: 0 0 24px; color: #666; line-height: 1.6; }
.preview-grid { display: grid; gap: 20px; }
.preview-card { background: #fff; border-radius: 20px; padding: 20px 22px; box-shadow: 0 12px 36px rgba(0,0,0,.06); }
.preview-card h2 { margin: 0 0 14px; font-size: 16px; }
.preview-feed { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; }
.demo-card { padding: 14px 16px; border: 1px solid #eee; border-radius: 14px; background: #fafafa; min-width: 220px; }
`;

const style = document.createElement('style');
style.textContent = pageCss + '\n' + noiseCss;
document.head.appendChild(style);

const app = document.getElementById('app')!;
app.innerHTML = `
  <div class="preview-page">
    <h1>知乎增强 · 样式预览</h1>
    <p class="lead">本地看设置面板、公式、试算和信息流角标。不连知乎。改 <code>src/styles/*.css</code> 会热更新。</p>
    <div class="preview-grid">
      <section class="preview-card" id="formula"></section>
      <section class="preview-card">
        <h2>信息流角标 / 口味按钮</h2>
        <div class="preview-feed">
          <article class="demo-card">
            <span>普通卡片</span>
            <span class="zhihu-plus-noise-tag" style="--t:.15">12</span>
            <span class="zhihu-plus-taste"><button type="button" data-taste="like">喜欢</button><button type="button" data-taste="dislike">不感兴趣</button></span>
          </article>
          <article class="demo-card zhihu-plus-noise-demote">
            <span>降权卡片</span>
            <span class="zhihu-plus-noise-tag" style="--t:.55">41</span>
            <span class="zhihu-plus-taste"><button type="button" class="is-on" data-taste="like">喜欢</button><button type="button" data-taste="dislike">不感兴趣</button></span>
          </article>
          <button type="button" id="zhihu-plus-noise-tray">已过滤 3 条</button>
        </div>
      </section>
      <section class="preview-card" id="test"></section>
      <section class="preview-card" id="taste"></section>
      <section class="preview-card">
        <h2>设置面板（Shadow）</h2>
        <p class="lead" style="margin-bottom:12px">和油猴里同一份 CSS。点按钮打开。</p>
        <button type="button" id="open-settings">打开设置</button>
        <div id="settings-host"></div>
      </section>
      <section class="preview-card">
        <h2>评分说明（Shadow）</h2>
        <div id="explain-host"></div>
      </section>
    </div>
  </div>
`;

document.getElementById('formula')!.innerHTML = '<h2>评分公式</h2>' + settingsNoiseFormulaHtml();
mountNoiseTestPane(document.getElementById('test')!);
mountTastePane(document.getElementById('taste')!);

document.getElementById('open-settings')!.onclick = async () => {
    const { openSettingsPanel } = await import('./settings-panel');
    openSettingsPanel();
};

const explainHost = document.getElementById('explain-host')!;
const explain = document.createElement('div');
explain.attachShadow({ mode: 'open' }).innerHTML = `<style>${explainCss}
:host { position: static !important; inset: auto !important; display: block; }
.zhihuE_NxMask { position: relative !important; inset: auto !important; }
</style>
<div class="zhihuE_NxMask" style="position:relative;inset:auto;padding:0;background:transparent;backdrop-filter:none;">
  <div class="zhihuE_NxCard" style="width:100%;max-height:none;box-shadow:none;">
    <div class="zhihuE_NxHead"><div><p class="zhihuE_NxKicker">Noise Score</p><h3>评分过程</h3></div><button type="button" class="zhihuE_NxClose">\u00d7</button></div>
    <div class="zhihuE_NxHero is-demote"><div class="zhihuE_NxScore">41</div><div><div class="zhihuE_NxVerdict">\u4f1a\u964d\u6743</div><p class="zhihuE_NxMix">\u9884\u89c8\u6837\u4f8b</p></div></div>
    <div class="zhihuE_NxHits"><div class="zhihuE_NxBlock"><span>\u5173\u952e\u8bcd</span><div><span class="zhihuE_NxChip"><em>\u70ed\u641c</em><b>8</b></span><span class="zhihuE_NxChip is-win"><em>\u5a31\u4e50\u516b\u5366</em><b>90</b></span></div></div></div>
  </div>
</div>`;
explainHost.appendChild(explain);
