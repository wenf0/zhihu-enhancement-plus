function openSettingsPanel() {
    if (document.querySelector('.zhihuE_StHost')) return;

    const lookKeys = ['menu_lowProfile', 'menu_fullWidth', 'menu_blankTitleFavicon', 'menu_cleanTitles', 'menu_cleanSearch'];
    const readKeys = ['menu_defaultCollapsedAnswer', 'menu_collapsedAnswer', 'menu_collapsedNowAnswer', 'menu_backToTop', 'menu_questionRichTextMore', 'menu_publishTop', 'menu_typeTips', 'menu_toQuestion'];
    const navItems = [
        { id: 'look', name: '外观', hint: '页面气质' },
        { id: 'read', name: '阅读', hint: '浏览节奏' }
    ];
    const blockItems = [
        { id: 'block-users', name: '屏蔽用户', hint: '黑名单' },
        { id: 'block-words', name: '关键词', hint: '噪音与词库' },
        { id: 'block-types', name: '指定类别', hint: '内容类型' }
    ];
    const dataItem = { id: 'data', name: '配置', hint: '导入导出' };
    let current = 'look';
    let wordTab = 'levels';

    const html = `<style class="zhihuE_StStyle">
:host {all:initial;display:block;position:fixed;inset:0;z-index:2147483646;font-family:-apple-system,BlinkMacSystemFont,"PingFang SC","Hiragino Sans GB","Noto Sans SC","Microsoft YaHei",sans-serif;color:#1d1d1f;line-height:1.5;}
*,*::before,*::after {box-sizing:border-box;}
button,input,textarea {font:inherit;color:inherit;}
.zhihuE_StMask {position:fixed;inset:0;z-index:1;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(18,18,18,.48);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);}
.zhihuE_StRoot {width:min(1240px,98vw);height:min(900px,94vh);display:flex;flex-direction:column;background:#fff;color:#1d1d1f;border-radius:24px;box-shadow:0 32px 100px rgba(0,0,0,.26);overflow:hidden;font-family:-apple-system,BlinkMacSystemFont,"PingFang SC","Hiragino Sans GB","Noto Sans SC","Microsoft YaHei",sans-serif;}
.zhihuE_StHead {padding:28px 36px 20px;display:flex;justify-content:space-between;align-items:flex-start;gap:16px;}
.zhihuE_StKicker {margin:0 0 6px;font-size:12px;letter-spacing:.16em;color:#aaa;text-transform:uppercase;}
.zhihuE_StTitle {margin:0;font-size:26px;font-weight:650;letter-spacing:.02em;}
.zhihuE_StTips {margin:8px 0 0;font-size:13px;line-height:1.65;color:#8a8a8a;}
.zhihuE_StMeta {margin:8px 0 0;font-size:12px;line-height:1.5;color:#aaa;font-variant-numeric:tabular-nums;}
.zhihuE_StClose {flex:none;width:36px;height:36px;border:0;border-radius:50%;background:#f4f4f5;color:#666;cursor:pointer;font-size:18px;line-height:1;}
.zhihuE_StClose:hover {background:#1d1d1f;color:#fff;}
.zhihuE_StMain {flex:1;min-height:0;display:flex;border-top:1px solid #eee;}
.zhihuE_StNav {width:236px;flex:none;padding:18px 14px;border-right:1px solid #eee;display:flex;flex-direction:column;gap:4px;overflow:auto;}
.zhihuE_StNavBtn {display:flex;flex-direction:column;align-items:flex-start;gap:2px;width:100%;padding:12px 14px;border:0;border-radius:14px;background:transparent;color:#666;cursor:pointer;text-align:left;font:inherit;}
.zhihuE_StNavBtn strong {font-size:15px;font-weight:600;}
.zhihuE_StNavBtn span {font-size:12px;color:#aaa;}
.zhihuE_StNavBtn.zhihuE_isOn {background:#1d1d1f;color:#fff;}
.zhihuE_StNavBtn.zhihuE_isOn span {color:rgba(255,255,255,.62);}
.zhihuE_StGroup {margin:8px 0 4px;}
.zhihuE_StGroupLabel {padding:8px 14px 6px;font-size:11px;letter-spacing:.16em;color:#bbb;text-transform:uppercase;}
.zhihuE_StNavSub {padding:10px 14px 10px 16px;border-radius:12px;}
.zhihuE_StNavSub strong {font-size:14px;}
.zhihuE_StNavFoot {margin-top:auto;padding:8px 6px 4px;}
.zhihuE_StLink {border:0;background:transparent;color:#8a8a8a;cursor:pointer;font-size:12px;padding:0;}
.zhihuE_StLink:hover {color:#1d1d1f;}
.zhihuE_StBody {flex:1;min-width:0;overflow:auto;padding:24px 32px 32px;display:flex;flex-direction:column;gap:12px;}
.zhihuE_StBody.is-fill {overflow:hidden;}
[data-zplus-row],[data-zplus-card] {display:flex;flex-direction:row;align-items:center;justify-content:space-between;gap:20px;padding:18px 22px;border:1px solid #ececec;border-radius:16px;background:#fff;box-shadow:0 8px 24px rgba(0,0,0,.04);flex:none;}
[data-zplus-card] {align-items:flex-start;padding:18px 20px;}
[data-zplus-row] > div,.zhihuE_LvCardMain {flex:1;min-width:0;}
[data-zplus-row]:not([data-on]) .zhihuE_StName,[data-zplus-card]:not([data-on]) .zhihuE_LvName {color:#6e6e73;}
[data-zplus-row][data-sub="1"] {padding:14px 20px 14px 26px;border-radius:14px;}
.zhihuE_StName {font-size:15px;font-weight:600;}
[data-zplus-row][data-sub="1"] .zhihuE_StName {font-size:14px;}
.zhihuE_StDesc {margin:4px 0 0;font-size:12px;line-height:1.6;color:#8a8a8a;}
[data-zplus-switch] {flex:none;width:48px;height:28px;min-width:48px;padding:0;border:0;border-radius:999px;background:#ddd;position:relative;cursor:pointer;align-self:center;appearance:none;-webkit-appearance:none;}
[data-zplus-switch][data-on] {background:#1d1d1f;}
[data-zplus-switch]::after {content:"";position:absolute;top:3px;left:3px;width:22px;height:22px;border-radius:50%;background:#fff;box-shadow:0 1px 4px rgba(0,0,0,.15);transition:transform .2s;}
[data-zplus-switch][data-on]::after {transform:translateX(20px);}
.zhihuE_StPaneTips {margin:0;font-size:13px;line-height:1.65;color:#8a8a8a;flex:none;}
.zhihuE_StTabs {display:flex;flex-wrap:wrap;gap:8px;flex:none;}
.zhihuE_StTab {height:34px;padding:0 14px;border:1px solid #eee;border-radius:999px;background:#fff;color:#666;cursor:pointer;font:inherit;font-size:13px;}
.zhihuE_StTab.zhihuE_isOn {background:#1d1d1f;border-color:#1d1d1f;color:#fff;}
.zhihuE_StPane {flex:1;min-height:0;display:flex;flex-direction:column;gap:12px;overflow:auto;}
.zhihuE_StPane.is-fill {overflow:hidden;}
.zhihuE_StFootNote {margin-top:4px;font-size:12px;color:#aaa;flex:none;}
.zhihuE_Fx {padding:20px 22px;border:1px solid #eee;border-radius:16px;background:#fafafa;flex:none;}
.zhihuE_FxKicker {margin:0 0 8px;font-size:11px;letter-spacing:.16em;color:#aaa;text-transform:uppercase;}
.zhihuE_FxMain {font-size:15px;font-weight:600;letter-spacing:.01em;line-height:1.55;font-variant-numeric:tabular-nums;}
.zhihuE_FxGrid {display:grid;grid-template-columns:repeat(auto-fill,minmax(168px,1fr));gap:10px;margin-top:14px;}
.zhihuE_FxItem {padding:12px 14px;border-radius:12px;background:#fff;border:1px solid #eee;}
.zhihuE_FxItem b {display:inline-block;min-width:18px;margin-right:6px;font-size:14px;}
.zhihuE_FxItem span {display:block;margin-top:6px;font-size:12px;line-height:1.55;color:#8a8a8a;font-weight:400;}
.zhihuE_FxNote {margin:12px 0 0;font-size:12px;line-height:1.65;color:#8a8a8a;}
.zhihuE_TasteHead {display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;}
.zhihuE_TasteList {display:flex;flex-direction:column;gap:8px;}
.zhihuE_TasteRow {display:grid;grid-template-columns:1fr auto auto;gap:10px;align-items:center;padding:10px 12px;border:1px solid #eee;border-radius:12px;background:#fff;}
.zhihuE_TasteRow b {font-size:13px;}
.zhihuE_TasteRow span {font-size:12px;color:#8a8a8a;}
.zhihuE_TasteRow em {font-style:normal;font-variant-numeric:tabular-nums;font-weight:650;}
.zhihuE_TasteRow em.is-up {color:#a33;}
.zhihuE_TasteRow em.is-down {color:#2e7d32;}
.zhihuE_Ts {display:flex;flex-direction:column;gap:12px;flex:none;}
.zhihuE_TsTitle,.zhihuE_TsBody {width:100%;padding:12px 16px;border:1px solid #e8e8e8;border-radius:12px;background:#fafafa;font:inherit;font-size:14px;outline:none;box-sizing:border-box;}
.zhihuE_TsTitle {height:44px;}
.zhihuE_TsBody {min-height:140px;resize:vertical;line-height:1.65;}
.zhihuE_TsTitle:focus,.zhihuE_TsBody:focus {border-color:#1d1d1f;background:#fff;box-shadow:0 0 0 4px rgba(29,29,31,.06);}
.zhihuE_TsBoard {padding:20px 22px;border:1px solid #eee;border-radius:16px;background:#fafafa;}
.zhihuE_TsBoard.is-keep {background:#f7faf7;border-color:#d7e6d7;}
.zhihuE_TsBoard.is-demote {background:#faf8f3;border-color:#eadfc8;}
.zhihuE_TsBoard.is-hide {background:#faf5f5;border-color:#e8d4d4;}
.zhihuE_TsHero {display:flex;align-items:baseline;gap:14px;}
.zhihuE_TsScore {font-size:42px;font-weight:650;letter-spacing:-.03em;line-height:1;font-variant-numeric:tabular-nums;}
.zhihuE_TsVerdict {font-size:16px;font-weight:600;}
.zhihuE_TsSub {margin-top:8px;font-size:12px;color:#8a8a8a;}
.zhihuE_TsGrid {display:grid;grid-template-columns:repeat(auto-fill,minmax(88px,1fr));gap:8px;margin-top:14px;}
.zhihuE_TsItem {padding:10px 12px;border-radius:12px;background:#fff;border:1px solid #eee;font-size:12px;color:#8a8a8a;}
.zhihuE_TsItem b {margin-right:4px;color:#1d1d1f;font-size:13px;}
.zhihuE_TsItem span {display:block;margin-top:4px;font-size:18px;font-weight:650;color:#1d1d1f;font-variant-numeric:tabular-nums;}
.zhihuE_TsHint {margin:12px 0 0;font-size:12px;line-height:1.65;color:#8a8a8a;}
.zhihuE_LvCardTop {display:flex;align-items:center;gap:10px;margin-bottom:6px;flex-wrap:wrap;}
.zhihuE_LvTag {flex:none;min-width:36px;padding:2px 8px;border-radius:999px;background:#1d1d1f;color:#fff;font-size:12px;font-weight:600;text-align:center;}
.zhihuE_LvName {font-size:16px;font-weight:600;}
.zhihuE_LvHint {font-size:12px;color:#aaa;}
.zhihuE_LvDesc {margin:0;font-size:13px;line-height:1.7;color:#666;}
.zhihuE_LvChips {display:flex;flex-wrap:wrap;gap:6px;margin-top:10px;}
.zhihuE_LvChip {padding:3px 8px;border-radius:999px;background:#f0f0f0;color:#666;font-size:12px;}
.zhihuE_ListMount,.zhihuE_LxMount,.zhihuE_IoMount {flex:1;min-height:0;display:flex;flex-direction:column;gap:12px;}
.zhihuE_DlgAdd {display:flex;gap:10px;flex:none;}
.zhihuE_DlgInput,.zhihuE_DlgFilter {width:100%;height:44px;padding:0 16px;border:1px solid #e8e8e8;border-radius:12px;background:#fafafa;font-size:14px;outline:none;}
.zhihuE_DlgInput:focus,.zhihuE_DlgFilter:focus {border-color:#1d1d1f;background:#fff;box-shadow:0 0 0 4px rgba(29,29,31,.06);}
.zhihuE_DlgAddBtn {flex:none;height:44px;padding:0 22px;border:0;border-radius:12px;background:#1d1d1f;color:#fff;font-size:14px;font-weight:500;cursor:pointer;}
.zhihuE_DlgAddBtn:hover {opacity:.88;}
.zhihuE_DlgFilterWrap {flex:none;}
.zhihuE_DlgCloud {flex:1;min-height:0;overflow:auto;padding:6px 2px 12px;display:flex;flex-wrap:wrap;align-content:flex-start;gap:10px;}
.zhihuE_KwBar {display:flex;align-items:center;justify-content:space-between;gap:12px;flex:none;}
.zhihuE_KwBarLabel {font-size:13px;color:#8a8a8a;}
.zhihuE_KwSeg {display:flex;flex-wrap:wrap;gap:6px;}
.zhihuE_KwSegBtn {height:30px;padding:0 12px;border:1px solid #eee;border-radius:999px;background:#fff;color:#666;cursor:pointer;font:inherit;font-size:12px;}
.zhihuE_KwSegBtn.zhihuE_isOn {background:#1d1d1f;border-color:#1d1d1f;color:#fff;}
.zhihuE_DlgChip {display:inline-flex;align-items:center;gap:8px;max-width:100%;padding:8px 8px 8px 14px;border:1px solid #ececec;border-radius:999px;background:#f7f7f7;font-size:13px;line-height:1.3;color:#333;cursor:pointer;}
.zhihuE_DlgChip.is-pack {padding-right:14px;}
.zhihuE_DlgChip.is-off {opacity:.4;}
.zhihuE_DlgChip:hover {background:#fff;border-color:#d4d4d4;box-shadow:0 4px 12px rgba(0,0,0,.04);}
.zhihuE_DlgChip span {overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.zhihuE_DlgChipLv {flex:none;height:22px;padding:0 8px;border:0;border-radius:999px;font:inherit;font-size:11px;line-height:22px;cursor:pointer;}
.zhihuE_DlgChipLv.is-hide {background:#f3e8e8;color:#a33;}
.zhihuE_DlgChipLv.is-demote {background:#f3eee4;color:#9a6b20;}
.zhihuE_DlgChipLv.is-weight {background:#ececec;color:#666;}
.zhihuE_DlgChipDel {flex:none;width:22px;height:22px;border:0;border-radius:50%;background:transparent;color:#999;font-size:16px;line-height:22px;cursor:pointer;}
.zhihuE_DlgChipDel:hover {background:#1d1d1f;color:#fff;}
.zhihuE_DlgEmpty {width:100%;padding:80px 0;text-align:center;color:#b0b0b0;font-size:14px;}
.zhihuE_DlgFoot {display:flex;align-items:center;justify-content:space-between;gap:16px;flex:none;color:#8a8a8a;font-size:13px;}
.zhihuE_DlgFootRight {display:flex;align-items:center;gap:10px;}
.zhihuE_DlgCopy {height:36px;padding:0 16px;border:1px solid #e4e4e4;border-radius:10px;background:#fff;color:#1d1d1f;font-size:13px;cursor:pointer;}
.zhihuE_DlgCopy:hover {background:#f7f7f7;border-color:#ccc;}
.zhihuE_DlgCopy.is-ok {background:#1d1d1f;border-color:#1d1d1f;color:#fff;}
.zhihuE_DlgImport {display:none;flex:none;}
.zhihuE_DlgImport.is-open {display:block;}
.zhihuE_DlgImportArea {width:100%;min-height:120px;padding:12px 14px;border:1px solid #e8e8e8;border-radius:12px;background:#fafafa;font-size:13px;line-height:1.6;resize:vertical;outline:none;box-sizing:border-box;font-family:inherit;}
.zhihuE_DlgImportActions {display:flex;justify-content:flex-end;gap:8px;margin-top:10px;}
.zhihuE_DlgCount b {color:#1d1d1f;font-weight:600;}
.zhihuE_LxMain {flex:1;min-height:0;display:flex;border:1px solid #eee;border-radius:16px;overflow:hidden;background:#fff;}
.zhihuE_LxNav {width:168px;flex:none;overflow:auto;padding:10px;background:#fafafa;}
.zhihuE_LxNavBtn {width:100%;text-align:left;border:0;background:transparent;border-radius:10px;padding:9px 10px;margin-bottom:4px;font-size:13px;cursor:pointer;color:#333;}
.zhihuE_LxNavBtn.zhihuE_isOn {background:#1d1d1f;color:#fff;}
.zhihuE_LxPane {flex:1;min-width:0;display:flex;flex-direction:column;padding:14px 16px 10px;}
.zhihuE_LxTabs {display:flex;gap:8px;margin-bottom:10px;}
.zhihuE_LxTab {height:30px;padding:0 12px;border:1px solid #e8e8e8;border-radius:999px;background:#fff;cursor:pointer;font-size:12px;}
.zhihuE_LxTab.zhihuE_isOn {background:#1d1d1f;border-color:#1d1d1f;color:#fff;}
.zhihuE_LxAdd {display:flex;gap:8px;margin-bottom:10px;}
.zhihuE_LxInput {flex:1;height:38px;padding:0 12px;border:1px solid #e8e8e8;border-radius:12px;background:#fafafa;font-size:13px;outline:none;}
.zhihuE_LxWeight {width:72px;flex:none;}
.zhihuE_LxBtn {height:38px;padding:0 14px;border:0;border-radius:12px;background:#1d1d1f;color:#fff;cursor:pointer;font-size:13px;}
.zhihuE_LxBtn.ghost {background:#fff;border:1px solid #e4e4e4;color:#1d1d1f;}
.zhihuE_LxCloud {flex:1;min-height:0;overflow:auto;display:flex;flex-wrap:wrap;align-content:flex-start;gap:8px;}
.zhihuE_LxChip {display:inline-flex;align-items:center;gap:6px;padding:6px 8px 6px 12px;border:1px solid #ececec;border-radius:999px;background:#f7f7f7;font-size:12px;}
.zhihuE_LxChip b {font-weight:600;color:#888;}
.zhihuE_LxDel {width:20px;height:20px;border:0;border-radius:50%;background:transparent;color:#999;cursor:pointer;}
.zhihuE_LxDel:hover {background:#1d1d1f;color:#fff;}
.zhihuE_LxEmpty {width:100%;padding:48px 0;text-align:center;color:#bbb;font-size:13px;}
.zhihuE_LxFoot {display:flex;justify-content:space-between;align-items:center;gap:12px;flex:none;color:#8a8a8a;font-size:13px;}
.zhihuE_LxFootRight {display:flex;gap:8px;flex-wrap:wrap;}
.zhihuE_IoArea {flex:1;min-height:180px;width:100%;padding:14px 16px;border:1px solid #e8e8e8;border-radius:12px;background:#fafafa;font:12px/1.55 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;resize:none;outline:none;box-sizing:border-box;}
.zhihuE_IoArea:focus {border-color:#1d1d1f;background:#fff;box-shadow:0 0 0 4px rgba(29,29,31,.06);}
.zhihuE_IoMsg {min-height:18px;font-size:12px;color:#c45c26;flex:none;}
.zhihuE_IoFoot {display:flex;flex-wrap:wrap;justify-content:space-between;gap:10px;flex:none;}
.zhihuE_IoBtns {display:flex;flex-wrap:wrap;gap:8px;}
.zhihuE_IoBtn {height:36px;padding:0 14px;border:1px solid #e4e4e4;border-radius:10px;background:#fff;color:#1d1d1f;font-size:13px;cursor:pointer;}
.zhihuE_IoBtn:hover {background:#f7f7f7;border-color:#ccc;}
.zhihuE_IoBtn.is-ok {background:#1d1d1f;border-color:#1d1d1f;color:#fff;}
.zhihuE_IoPrimary {background:#1d1d1f;border-color:#1d1d1f;color:#fff;}
.zhihuE_IoPrimary:hover {opacity:.88;background:#1d1d1f;}
.zhihuE_IoFile {display:none;}
.zhihuE_IoStat {margin:0;font-size:12px;line-height:1.5;color:#aaa;font-variant-numeric:tabular-nums;flex:none;}
[data-theme="dark"] .zhihuE_StRoot {background:#2b2f36;color:#e8edf2;}
[data-theme="dark"] .zhihuE_StMain,[data-theme="dark"] .zhihuE_StNav,[data-theme="dark"] .zhihuE_LxMain {border-color:#3c434d;}
[data-theme="dark"] .zhihuE_StKicker,[data-theme="dark"] .zhihuE_StTips,[data-theme="dark"] .zhihuE_StMeta,[data-theme="dark"] .zhihuE_IoStat,[data-theme="dark"] .zhihuE_StDesc,[data-theme="dark"] .zhihuE_StLink,[data-theme="dark"] .zhihuE_StNavBtn span,[data-theme="dark"] .zhihuE_StGroupLabel,[data-theme="dark"] .zhihuE_StPaneTips,[data-theme="dark"] .zhihuE_LvHint,[data-theme="dark"] .zhihuE_LvDesc,[data-theme="dark"] .zhihuE_DlgFoot,[data-theme="dark"] .zhihuE_LxFoot {color:#9aa4b2;}
[data-theme="dark"] .zhihuE_StClose,[data-theme="dark"] [data-zplus-row],[data-theme="dark"] [data-zplus-card],[data-theme="dark"] .zhihuE_DlgInput,[data-theme="dark"] .zhihuE_DlgFilter,[data-theme="dark"] .zhihuE_DlgChip,[data-theme="dark"] .zhihuE_LxNav,[data-theme="dark"] .zhihuE_LxInput,[data-theme="dark"] .zhihuE_LxChip {background:#343a44;border-color:#3c434d;color:#e8edf2;}
[data-theme="dark"] [data-zplus-row][data-on],[data-theme="dark"] [data-zplus-card][data-on] {background:#3a414c;}
[data-theme="dark"] .zhihuE_StClose:hover,[data-theme="dark"] .zhihuE_StNavBtn.zhihuE_isOn,[data-theme="dark"] [data-zplus-switch][data-on],[data-theme="dark"] .zhihuE_StTab.zhihuE_isOn,[data-theme="dark"] .zhihuE_DlgAddBtn,[data-theme="dark"] .zhihuE_DlgChipDel:hover,[data-theme="dark"] .zhihuE_LxNavBtn.zhihuE_isOn,[data-theme="dark"] .zhihuE_LxTab.zhihuE_isOn,[data-theme="dark"] .zhihuE_LxBtn,[data-theme="dark"] .zhihuE_LxDel:hover {background:#e8edf2;color:#1d1d1f;}
[data-theme="dark"] .zhihuE_StNavBtn,[data-theme="dark"] .zhihuE_LxNavBtn {color:#c5ced8;}
[data-theme="dark"] .zhihuE_StNavBtn.zhihuE_isOn span {color:rgba(29,29,31,.55);}
[data-theme="dark"] [data-zplus-switch] {background:#4a5260;}
[data-theme="dark"] .zhihuE_StLink:hover {color:#fff;}
[data-theme="dark"] .zhihuE_StTab,[data-theme="dark"] .zhihuE_KwSegBtn {background:#343a44;border-color:#3c434d;color:#c5ced8;}
[data-theme="dark"] .zhihuE_KwSegBtn.zhihuE_isOn {background:#e8edf2;border-color:#e8edf2;color:#1d1d1f;}
[data-theme="dark"] .zhihuE_DlgChipLv.is-hide {background:#4a3535;color:#f0b6b6;}
[data-theme="dark"] .zhihuE_DlgChipLv.is-demote {background:#4a4030;color:#e6c48a;}
[data-theme="dark"] .zhihuE_DlgChipLv.is-weight {background:#3c434d;color:#c5ced8;}
[data-theme="dark"] .zhihuE_LvTag {background:#e8edf2;color:#1d1d1f;}
[data-theme="dark"] .zhihuE_LvChip {background:#2b2f36;color:#c5ced8;}
[data-theme="dark"] .zhihuE_Fx {background:#343a44;border-color:#3c434d;}
[data-theme="dark"] .zhihuE_FxItem {background:#3a414c;border-color:#3c434d;}
[data-theme="dark"] .zhihuE_FxKicker,[data-theme="dark"] .zhihuE_FxItem span,[data-theme="dark"] .zhihuE_FxNote,[data-theme="dark"] .zhihuE_TsSub,[data-theme="dark"] .zhihuE_TsHint,[data-theme="dark"] .zhihuE_TsItem,[data-theme="dark"] .zhihuE_TasteRow span {color:#9aa4b2;}
[data-theme="dark"] .zhihuE_TasteRow {background:#343a44;border-color:#3c434d;}
[data-theme="dark"] .zhihuE_TsTitle,[data-theme="dark"] .zhihuE_TsBody,[data-theme="dark"] .zhihuE_TsBoard,[data-theme="dark"] .zhihuE_TsItem {background:#343a44;border-color:#3c434d;color:#e8edf2;}
[data-theme="dark"] .zhihuE_TsBoard.is-keep {background:#2f3a34;border-color:#3d5244;}
[data-theme="dark"] .zhihuE_TsBoard.is-demote {background:#3a372f;border-color:#534832;}
[data-theme="dark"] .zhihuE_TsBoard.is-hide {background:#3a3232;border-color:#534040;}
[data-theme="dark"] .zhihuE_TsItem b,[data-theme="dark"] .zhihuE_TsItem span {color:#e8edf2;}
[data-theme="dark"] .zhihuE_DlgCopy,[data-theme="dark"] .zhihuE_IoBtn,[data-theme="dark"] .zhihuE_LxBtn.ghost {background:#343a44;border-color:#3c434d;color:#e8edf2;}
[data-theme="dark"] .zhihuE_DlgCopy.is-ok,[data-theme="dark"] .zhihuE_IoBtn.is-ok,[data-theme="dark"] .zhihuE_IoPrimary {background:#e8edf2;border-color:#e8edf2;color:#1d1d1f;}
[data-theme="dark"] .zhihuE_DlgImportArea,[data-theme="dark"] .zhihuE_IoArea {background:#343a44;border-color:#3c434d;color:#e8edf2;}
[data-theme="dark"] .zhihuE_DlgCount b {color:#fff;}
</style>
<div class="zhihuE_StMask">
  <div class="zhihuE_StRoot">
    <div class="zhihuE_StHead">
      <div>
        <p class="zhihuE_StKicker">Zhihu Enhancement Plus</p>
        <h3 class="zhihuE_StTitle">设置</h3>
        <p class="zhihuE_StMeta"></p>
        <p class="zhihuE_StTips">开关即时保存，刷新后生效。屏蔽相关已放在左侧二级菜单，内容直接铺在右侧。</p>
      </div>
      <button type="button" class="zhihuE_StClose" aria-label="关闭">×</button>
    </div>
    <div class="zhihuE_StMain">
      <div class="zhihuE_StNav"></div>
      <div class="zhihuE_StBody"></div>
    </div>
  </div>
</div>`;

    const host = document.createElement('div');
    host.className = 'zhihuE_StHost';
    const shadow = host.attachShadow({ mode: 'open' });
    shadow.innerHTML = html;
    document.body.appendChild(host);
    const mask = shadow.querySelector('.zhihuE_StMask');
    const navEl = mask.querySelector('.zhihuE_StNav');
    const bodyEl = mask.querySelector('.zhihuE_StBody');
    const metaEl = mask.querySelector('.zhihuE_StMeta');
    const pageTheme = document.documentElement.getAttribute('data-theme')
        || document.documentElement.getAttribute('data-theme-type')
        || document.body.getAttribute('data-theme')
        || '';
    if (pageTheme === 'dark') mask.setAttribute('data-theme', 'dark');

    const refreshMeta = () => {
        metaEl.textContent = settingsMetaText();
    };

    const close = () => {
        document.removeEventListener('keydown', onKey);
        host.remove();
    };
    const onKey = event => {
        if (event.key === 'Escape') close();
    };

    const navButton = (item, extra = '') =>
        `<button type="button" class="zhihuE_StNavBtn${extra}${item.id === current ? ' zhihuE_isOn' : ''}" data-id="${item.id}"><strong>${escapeHtml(item.name)}</strong><span>${escapeHtml(item.hint)}</span></button>`;

    const renderNav = () => {
        navEl.innerHTML = navItems.map(item => navButton(item)).join('') +
            `<div class="zhihuE_StGroup"><div class="zhihuE_StGroupLabel">屏蔽</div>${blockItems.map(item => navButton(item, ' zhihuE_StNavSub')).join('')}</div>` +
            navButton(dataItem) +
            '<div class="zhihuE_StNavFoot"><button type="button" class="zhihuE_StLink">反馈与建议</button></div>';
    };

    const renderBody = () => {
        const scoreOn = !!menuValue('menu_noiseScore');
        const usersOn = !!menuValue('menu_blockUsers');
        const fill = (current === 'block-users' && usersOn) || (current === 'block-words' && scoreOn) || current === 'data';
        bodyEl.classList.toggle('is-fill', fill);
        if (current === 'look') {
            bodyEl.innerHTML = lookKeys.map(key => settingsSwitchRow(key)).join('');
            return;
        }
        if (current === 'read') {
            bodyEl.innerHTML = readKeys.map(key => settingsSwitchRow(key)).join('');
            return;
        }
        if (current === 'block-users') {
            bodyEl.innerHTML = settingsSwitchRow('menu_blockUsers') + (usersOn
                ? ''
                : '<p class="zhihuE_StPaneTips">关闭后不再屏蔽名单中的用户。名单已折叠，打开后仍用上次的名单。</p>');
            if (!usersOn) return;
            mountListEditor(bodyEl, {
                storageKey: 'menu_customBlockUsers',
                placeholder: '例如：盐选推荐, 故事档案局',
                tips: '用户名需完全匹配。预置名单只能开关，自己加的可以开关或删除。'
            });
            return;
        }
        if (current === 'block-words') {
            bodyEl.innerHTML = settingsSwitchRow('menu_noiseScore') + (scoreOn
                ? settingsFilterRow() +
                    settingsSwitchRow('menu_noiseBadge', ' is-sub') +
                    settingsSwitchRow('menu_noiseTaste', ' is-sub') +
                    `<div class="zhihuE_StTabs">
                    <button type="button" class="zhihuE_StTab${wordTab === 'levels' ? ' zhihuE_isOn' : ''}" data-tab="levels">过滤档位</button>
                    <button type="button" class="zhihuE_StTab${wordTab === 'custom' ? ' zhihuE_isOn' : ''}" data-tab="custom">自定义词</button>
                    <button type="button" class="zhihuE_StTab${wordTab === 'lexicon' ? ' zhihuE_isOn' : ''}" data-tab="lexicon">噪音词库</button>
                    <button type="button" class="zhihuE_StTab${wordTab === 'taste' ? ' zhihuE_isOn' : ''}" data-tab="taste">口味</button>
                    <button type="button" class="zhihuE_StTab${wordTab === 'test' ? ' zhihuE_isOn' : ''}" data-tab="test">试算</button>
                </div>
                <div class="zhihuE_StPane${wordTab === 'levels' || wordTab === 'test' || wordTab === 'taste' ? '' : ' is-fill'}"></div>`
                : '<p class="zhihuE_StPaneTips">评分关闭后，过滤和角标都不会生效。档位、词库和试算已折叠，打开后仍用上次的设置。</p>');
            if (!scoreOn) return;
            const pane = bodyEl.querySelector('.zhihuE_StPane');
            if (wordTab === 'levels') {
                pane.innerHTML = settingsNoiseFormulaHtml() + settingsNoiseCards().map(settingsToggleCard).join('');
            } else if (wordTab === 'custom') {
                mountKeywordEditor(pane);
            } else if (wordTab === 'lexicon') {
                mountLexiconEditor(pane);
            } else if (wordTab === 'taste') {
                mountTastePane(pane);
            } else {
                mountNoiseTestPane(pane);
            }
            return;
        }
        if (current === 'block-types') {
            bodyEl.innerHTML = '<p class="zhihuE_StPaneTips">勾选后隐藏对应类型的信息流，刷新页面后生效。</p>' +
                settingsTypeCards().map(settingsToggleCard).join('');
            return;
        }
        mountIoPane(bodyEl);
    };

    const render = () => {
        renderNav();
        renderBody();
        refreshMeta();
    };

    mask.querySelector('.zhihuE_StClose').onclick = close;
    mask.addEventListener('click', event => {
        if (event.target === mask) close();
    });
    navEl.addEventListener('click', event => {
        const link = event.target.closest('.zhihuE_StLink');
        if (link) {
            GM_openInTab('https://github.com/wenf0/zhihu-enhancement-plus/issues', { active: true, insert: true, setParent: true });
            return;
        }
        const btn = event.target.closest('.zhihuE_StNavBtn');
        if (!btn) return;
        current = btn.dataset.id;
        render();
    });
    bodyEl.addEventListener('click', event => {
        const tab = event.target.closest('.zhihuE_StTab');
        if (tab && tab.dataset.tab) {
            wordTab = tab.dataset.tab;
            renderBody();
            return;
        }
        const filterBtn = event.target.closest('[data-filter]');
        if (filterBtn && filterBtn.dataset.filter) {
            menuSet('menu_blockKeywords', filterBtn.dataset.filter);
            renderBody();
            return;
        }
        const sw = event.target.closest('[data-zplus-switch]');
        if (!sw) return;
        const key = sw.dataset.key;
        const next = !menuValue(key);
        menuSet(key, next);
        if (key === 'menu_noiseScore' || key === 'menu_blockUsers') {
            renderBody();
            return;
        }
        sw.toggleAttribute('data-on', next);
        const row = sw.closest('[data-zplus-row], [data-zplus-card]');
        if (row) row.toggleAttribute('data-on', next);
    });
    document.addEventListener('keydown', onKey);
    render();
}

function parseWeightedWords(input, fallback = 6) {
    const out = Object.create(null);
    for (const part of String(input || '').split(/[,，|/\n\r]+/)) {
        const raw = part.trim();
        if (!raw) continue;
        const m = raw.match(/^(.+?)[:：]\s*(\d+(?:\.\d+)?)$/);
        const word = (m ? m[1] : raw).replace(/\s+/g, '');
        const weight = m ? Number(m[2]) : fallback;
        if (!word) continue;
        out[word] = Math.max(1, Math.min(20, weight));
    }
    return out;
}

function escapeHtml(text) {
    return String(text).replace(/[&<>"']/g, ch => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[ch]));
}

function parseWords(input) {
    return String(input || '').split(/[,，|/\n\r]+/).map(s => s.replace(/\s+/g, '')).filter(Boolean);
}

function uniqueWords(words) {
    const seen = new Set();
    const out = [];
    for (const word of words) {
        const key = word.toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);
        out.push(word);
    }
    return out;
}
