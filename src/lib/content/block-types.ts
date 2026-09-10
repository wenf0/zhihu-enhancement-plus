// @ts-nocheck
import { menuValue } from '../storage';
import { injectStyle, observeTree, hideClosest, forAddedElements, eachMatch, qsa, qs, on, onReadyNodes, page } from '../utils';

/* -------------------------------------------------------------------------- */
/* 屏蔽类别 / 盐选 / 热榜                                                     */
/* -------------------------------------------------------------------------- */

export function blockType(type) {
    let name;
    if (type === 'search') {
        if (!menuValue('menu_blockTypeVideo') && !menuValue('menu_blockTypeArticle') && !menuValue('menu_blockTypePin') && !menuValue('menu_blockTypeTopic') && !menuValue('menu_blockTypeSearch')) return;
        if (menuValue('menu_blockTypeSearch') && location.pathname === '/search') {
            setTimeout(() => qsa('.RelevantQuery').forEach(r => { r.parentElement.parentElement.hidden = true; }), 2000);
        }
        name = 'h2.ContentItem-title a:not(.zhihu_e_toQuestion), a.KfeCollection-PcCollegeCard-link, h2.SearchTopicHeader-Title a';
        onReadyNodes(name, blockTypeNode);
    } else if (type === 'question') {
        if (!menuValue('menu_blockTypeVideo')) return;
        injectStyle('zhihu-plus-hide-video-answer', `.VideoAnswerPlayer, .VideoAnswerPlayer video, .VideoAnswerPlayer-video, .VideoAnswerPlayer-iframe {display: none !important;}`);
        name = '.VideoAnswerPlayer';
        qsa(name).forEach(blockTypeNode);
    } else {
        if (!menuValue('menu_blockTypeVideo') && !menuValue('menu_blockTypeArticle') && !menuValue('menu_blockTypePin')) return;
        if (menuValue('menu_blockTypeVideo')) {
            injectStyle('zhihu-plus-hide-index-video', `.Card .ZVideoItem-video, .VideoAnswerPlayer video, nav.TopstoryTabs > a[aria-controls="Topstory-zvideo"] {display: none !important;}`);
        }
        name = menuValue('menu_blockTypePin')
            ? 'h2.ContentItem-title a:not(.zhihu_e_toQuestion), .ContentItem.PinItem'
            : 'h2.ContentItem-title a:not(.zhihu_e_toQuestion)';
        qsa(name).forEach(blockTypeNode);
    }

    observeTree(mutations => {
        forAddedElements(mutations, target => {
            if (target.className === 'Card SearchResult-Card' && target.dataset.zaDetailViewPathModule === undefined) {
                if (menuValue('menu_blockTypeSearch') && location.pathname === '/search' && location.search.includes('type=content')) {
                    target.hidden = true;
                }
            } else {
                eachMatch(target, name, blockTypeNode);
            }
        });
    });

    on(window, 'urlchange', () => {
        onReadyNodes(name, blockTypeNode);
        if (menuValue('menu_blockTypeSearch') && location.pathname === '/search' && location.search.includes('type=content')) {
            setTimeout(() => qsa('.RelevantQuery').forEach(r => { r.parentElement.parentElement.hidden = true; }), 1500);
        }
    });
}

export function blockTypeNode(titleA) {
    if (!titleA) return;
    const feedCard = '.Card.TopstoryItem.TopstoryItem-isRecommend';
    const searchCard = '.Card.SearchResult-Card';
    if (location.pathname === '/search') {
        if (!location.search.includes('type=content')) return;
        const href = titleA.href || '';
        if ((href.includes('/zvideo/') || href.includes('video.zhihu.com')) && menuValue('menu_blockTypeVideo')) {
            hideClosest(titleA, '.Card', true);
        } else if (href.includes('zhuanlan.zhihu.com') && menuValue('menu_blockTypeArticle')) {
            hideClosest(titleA, searchCard);
        } else if (href.includes('/topic/') && menuValue('menu_blockTypeTopic')) {
            hideClosest(titleA, searchCard);
        } else if (href.includes('/market/') && menuValue('menu_blockTypeSearch')) {
            hideClosest(titleA, searchCard);
        }
        return;
    }

    if (location.pathname.includes('/question/')) {
        if (menuValue('menu_blockTypeVideo')) hideClosest(titleA, '.List-item');
        return;
    }

    if (titleA.classList.contains('PinItem')) {
        if (menuValue('menu_blockTypePin')) hideClosest(titleA, feedCard);
        return;
    }

    const href = titleA.href || '';
    if ((href.includes('/zvideo/') || href.includes('video.zhihu.com') || href.includes('/education/video-course/')) && menuValue('menu_blockTypeVideo')) {
        hideClosest(titleA, feedCard);
    } else if (href.includes('/answer/')) {
        const answer = titleA.closest('.ContentItem.AnswerItem');
        if (answer && qs('.VideoAnswerPlayer', answer) && menuValue('menu_blockTypeVideo')) {
            hideClosest(titleA, feedCard);
            answer.remove();
        }
    } else if (href.includes('zhuanlan.zhihu.com') && menuValue('menu_blockTypeArticle')) {
        hideClosest(titleA, feedCard);
    }
}

export function blockYanXuan() {
    if (!menuValue('menu_blockYanXuan')) return;
    const isYanXuan = item => item.querySelector('.KfeCollection-AnswerTopCard-Container, .KfeCollection-PurchaseBtn');
    observeTree(mutations => {
        forAddedElements(mutations, target => {
            if (page().isAnswer) {
                target.querySelectorAll('.List-item, .Card.AnswerCard').forEach(item => {
                    if (isYanXuan(item)) item.hidden = true;
                });
            } else if (target.className === 'List-item' || target.className === 'Card AnswerCard') {
                if (isYanXuan(target)) target.hidden = true;
            }
        });
    });
    document.querySelectorAll('.List-item, .Card.AnswerCard').forEach(item => {
        if (isYanXuan(item)) item.hidden = true;
    });
}

export function blockHotOther() {
    if (!menuValue('menu_blockTypeLiveHot')) return;
    const isQuestionItem = hotItem => {
        const linkItem = hotItem.querySelector('.HotItem-content a');
        return !!(linkItem && /\/question\/\d+/.test(linkItem.href));
    };
    const block = () => {
        document.querySelectorAll('.HotList-list .HotItem').forEach(item => {
            if (!isQuestionItem(item)) item.remove();
        });
        document.querySelectorAll('.HotList-list .HotItem:not([hidden])').forEach((item, index) => {
            const rank = item.querySelector('.HotItem-index .HotItem-rank');
            if (rank) rank.innerText = index + 1;
        });
    };
    observeTree(mutations => {
        forAddedElements(mutations, target => {
            if (target.classList && target.classList.contains('HotItem')) block();
        });
    });
    block();
}
