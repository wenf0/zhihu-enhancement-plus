// @ts-nocheck
import { menuValue } from '../storage';
import { page, addUrlChangeEvent, injectStyle, removeStyle } from '../utils';
import { ensureJieba } from '../noise/jieba';
import {
    collapsedAnswer, defaultCollapsedAnswer, closeFloatingComments,
    bindSideGestures
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

/** 设置变更后同步可逆 UI（CSS / 按钮 / 手势开关读缓存）。 */
export function syncUiFromSettings() {
    fullWidthLayout();
    lowProfileMode();
    cleanSearch();
    addTypeTips();
    addToQuestion();
    collapsedAnswer();
    defaultCollapsedAnswer();
    bindSideGestures();
    if (!menuValue('menu_blockTypeVideo')) removeStyle('zhihu-plus-hide-zvideo-tab');
    else if (page().isHome || page().isFollow || page().isHot) {
        injectStyle('zhihu-plus-hide-zvideo-tab', `.Card .ZVideoItem-video, nav.TopstoryTabs > a[aria-controls="Topstory-zvideo"] {display: none !important;}`);
    }
}

export function boot() {
    ensureJieba();
    addUrlChangeEvent();
    bindSideGestures();

    window.addEventListener('urlchange', () => {
        const p = page();
        if (p.isQuestion && !p.isQuestionWaiting && !p.isAnswer) {
            setTimeout(() => {
                collapsedAnswer();
                questionRichTextMore();
                blockUsers('question');
                blockYanXuan();
            }, 300);
        } else if (p.isHome) {
            setTimeout(() => {
                blockUsers('index');
                blockKeywords('index');
                blockType();
                collapsedAnswer();
            }, 500);
        } else if (p.isHot) {
            setTimeout(() => {
                blockKeywords('index');
                blockHotOther();
                collapsedAnswer();
            }, 500);
        } else {
            setTimeout(() => collapsedAnswer(), 300);
        }
    });

    fullWidthLayout();
    lowProfileMode();
    blankTitleAndFavicon();
    removeLogin();
    cleanTitles();

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => start(), { once: true });
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
            watchTopTime('.ContentItem.AnswerItem, .ContentItem.ArticleItem', 'ContentItem-meta');
            addTypeTips();
            addToQuestion();
            blockUsers('topic');
            blockKeywords('topic');
        }
        return;
    }

    if (p.isZhuanlan) {
        setTimeout(topTimePost, 300);
        blockUsers();
        return;
    }

    if (p.isColumn) {
        setTimeout(() => {
            collapsedAnswer();
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
        watchTopTime('.ContentItem.AnswerItem, .ContentItem.ArticleItem', 'ContentItem-meta');
        blockUsers('people');
        blockKeywords('people');
        return;
    }

    if (p.isCollection) {
        addTypeTips();
        addToQuestion();
        watchTopTime('.ContentItem.AnswerItem, .ContentItem.ArticleItem', 'ContentItem-meta');
        blockKeywords('collection');
        return;
    }

    injectStyle('zhihu-plus-min-height', '.Topstory-container {min-height: 1500px;}');
    if (menuValue('menu_blockTypeVideo')) {
        injectStyle('zhihu-plus-hide-zvideo-tab', `.Card .ZVideoItem-video, nav.TopstoryTabs > a[aria-controls="Topstory-zvideo"] {display: none !important;}`);
    }
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
