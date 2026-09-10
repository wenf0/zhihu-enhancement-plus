import { GM_info } from '$';
import { menuValue } from './config';
import { page, addUrlChangeEvent, injectStyle } from './utils';
import { registerMenuCommand } from './settings-panel';
import { ensureJieba } from './noise-jieba';
import {
    collapsedAnswer, collapsedNowAnswer, defaultCollapsedAnswer, closeFloatingComments, backToTop
} from './collapse';
import { blockUsers } from './block-users';
import { blockKeywords } from './noise-ui';
import { blockType, blockYanXuan, blockHotOther } from './block-types';
import {
    fullWidthLayout, lowProfileMode, blankTitleAndFavicon, removeLogin, cleanTitles,
    bindEmptySearchPlaceholder, removeHighlightLink, enhanceMediaAndLinks, cleanSearch,
    watchTopTime, addTypeTips, addToQuestion, questionRichTextMore, questionTime,
    questionAuthor, questionInvitation, topTimePost
} from './enhance';

/* -------------------------------------------------------------------------- */
/* 路由                                                                       */
/* -------------------------------------------------------------------------- */

export function boot() {
    registerMenuCommand();
    ensureJieba();
    if (window.onurlchange === undefined) addUrlChangeEvent();

    window.addEventListener('urlchange', () => {
        const p = page();
        if (p.isQuestion && !p.isQuestionWaiting && !p.isAnswer) {
            setTimeout(() => {
                collapsedNowAnswer('.QuestionPage');
                collapsedNowAnswer('.Question-main');
                questionRichTextMore();
                blockUsers('question');
                blockYanXuan();
            }, 300);
        } else if (p.isHome) {
            setTimeout(() => {
                blockUsers('index');
                blockKeywords('index');
                blockType();
            }, 500);
        } else if (p.isHot) {
            setTimeout(() => {
                blockKeywords('index');
                blockHotOther();
            }, 500);
        }
    });

    fullWidthLayout();
    lowProfileMode();
    blankTitleAndFavicon();
    removeLogin();
    cleanTitles();

    const handler = GM_info.scriptHandler;
    const version = parseFloat(String(GM_info.version || '').slice(0, 4));
    if (handler === 'Violentmonkey' || (handler === 'Tampermonkey' && version >= 4.18)) {
        setTimeout(start, 300);
    } else {
        start();
    }
}

export function start() {
    const p = page();
    if (menuValue('menu_lowProfile') || menuValue('menu_cleanSearch')) bindEmptySearchPlaceholder();
    removeHighlightLink();
    enhanceMediaAndLinks();
    if (!p.isZhuanlan) {
        if (!p.isColumn) cleanSearch();
        collapsedAnswer();
    }
    closeFloatingComments();
    blockKeywords('comment');

    if (p.isQuestion) {
        if (!p.isQuestionWaiting) {
            collapsedNowAnswer('.QuestionPage');
            collapsedNowAnswer('.Question-main');
            questionRichTextMore();
            blockUsers('question');
            blockYanXuan();
            blockType('question');
            defaultCollapsedAnswer();
        }
        watchTopTime('.ContentItem.AnswerItem', 'ContentItem-meta');
        setTimeout(() => { questionTime(); questionAuthor(); }, 100);
        questionInvitation();
        return;
    }

    if (p.isSearch) {
        collapsedNowAnswer('main div');
        collapsedNowAnswer('.Search-container');
        watchTopTime('.ContentItem.AnswerItem, .ContentItem.ArticleItem', 'SearchItem-meta');
        addTypeTips();
        addToQuestion();
        blockUsers('search');
        blockKeywords('search');
        blockType('search');
        return;
    }

    if (p.isTopic) {
        if (p.pathname.includes('/hot') || p.href.includes('/top-answers')) {
            collapsedNowAnswer('main.App-main');
            watchTopTime('.ContentItem.AnswerItem, .ContentItem.ArticleItem', 'ContentItem-meta');
            addTypeTips();
            addToQuestion();
            blockUsers('topic');
            blockKeywords('topic');
        }
        return;
    }

    if (p.isZhuanlan) {
        backToTop('article.Post-Main.Post-NormalMain');
        backToTop('div.Post-Sub.Post-NormalSub');
        setTimeout(topTimePost, 300);
        blockUsers();
        return;
    }

    if (p.isColumn) {
        setTimeout(() => {
            collapsedAnswer();
            collapsedNowAnswer('main div');
            watchTopTime('.ContentItem.AnswerItem, .ContentItem.ArticleItem', 'ContentItem-meta');
            blockUsers();
        }, 300);
        return;
    }

    if (p.isPeople) {
        if (p.pathname.split('/').length === 3) {
            addTypeTips();
            addToQuestion();
        }
        collapsedNowAnswer('main div');
        collapsedNowAnswer('.Profile-main');
        watchTopTime('.ContentItem.AnswerItem, .ContentItem.ArticleItem', 'ContentItem-meta');
        blockUsers('people');
        blockKeywords('people');
        return;
    }

    if (p.isCollection) {
        addTypeTips();
        addToQuestion();
        collapsedNowAnswer('main');
        collapsedNowAnswer('.CollectionsDetailPage');
        watchTopTime('.ContentItem.AnswerItem, .ContentItem.ArticleItem', 'ContentItem-meta');
        blockKeywords('collection');
        return;
    }

    injectStyle('zhihu-plus-min-height', '.Topstory-container {min-height: 1500px;}');
    if (menuValue('menu_blockTypeVideo')) {
        injectStyle('zhihu-plus-hide-zvideo-tab', `.Card .ZVideoItem-video, nav.TopstoryTabs > a[aria-controls="Topstory-zvideo"] {display: none !important;}`);
    }
    collapsedNowAnswer('main div');
    collapsedNowAnswer('.Topstory-container');
    watchTopTime('.TopstoryItem', 'ContentItem-meta');
    addTypeTips();
    addToQuestion();
    if (p.isHome) {
        blockUsers('index');
        blockKeywords('index');
        blockType();
    } else if (p.isHot) {
        blockKeywords('index');
        blockHotOther();
    } else {
        blockUsers();
    }
}
