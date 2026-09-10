import { GM_xmlhttpRequest } from '$';
import { menuValue, menuSet, isPackedListItem, readListOff, writeListOff, activeListValues } from './config';
import { observeTree, forAddedElements, hideClosest, notify, page } from './utils';

/* -------------------------------------------------------------------------- */
/* 屏蔽用户 / 关键词                                                          */
/* -------------------------------------------------------------------------- */

export function authorFromZop(item) {
    const zop = item && item.dataset && item.dataset.zop;
    if (!zop) return '';
    const m = zop.match(/authorName":"([^"]+)"/);
    return m ? m[1] : '';
}

export function userBlocked(name) {
    return !!(name && activeListValues('menu_customBlockUsers').includes(name));
}

export function hideBlockedCard(card, item) {
    const name = authorFromZop(item);
    if (!userBlocked(name)) return false;
    card.hidden = true;
    return true;
}

export function blockUsers(type) {
    if (!menuValue('menu_blockUsers')) return;
    const list = menuValue('menu_customBlockUsers');
    if (!list || !list.length) return;

    switch (type) {
        case 'index':
            blockUsersFeed('.Card.TopstoryItem.TopstoryItem-isRecommend', 'Card TopstoryItem TopstoryItem-isRecommend');
            break;
        case 'question':
            blockUsersQuestion();
            break;
        case 'search':
            blockUsersSearch();
            break;
        case 'topic':
            blockUsersFeed('.List-item.TopicFeedItem', 'List-item TopicFeedItem');
            break;
        case 'people':
            blockUsersButtonPeople();
            break;
    }
    blockUsersComment();
    blockUsersHoverButton();
}

export function blockUsersFeed(selector, className) {
    const scan = () => {
        document.querySelectorAll(selector).forEach(card => {
            hideBlockedCard(card, card.querySelector('.ContentItem.AnswerItem, .ContentItem.ArticleItem'));
        });
    };
    scan();
    window.addEventListener('urlchange', () => setTimeout(scan, 1000));
    observeTree(mutations => {
        forAddedElements(mutations, target => {
            if (target.className === className) {
                hideBlockedCard(target, target.querySelector('.ContentItem.AnswerItem, .ContentItem.ArticleItem'));
            }
        });
    });
}

export function blockUsersQuestion() {
    const hideItem = item => {
        const answer = item.querySelector('.ContentItem.AnswerItem');
        if (answer) hideBlockedCard(item, answer);
    };
    const onAdd = mutations => {
        forAddedElements(mutations, target => {
            if (page().isAnswer) {
                target.querySelectorAll('.List-item, .Card.AnswerCard').forEach(hideItem);
            } else if (target.className === 'List-item' || target.className === 'Card AnswerCard') {
                hideItem(target);
            }
        });
    };
    observeTree(onAdd);
    document.querySelectorAll('.List-item, .Card.AnswerCard').forEach(hideItem);
}

export function blockUsersSearch() {
    const scan = () => {
        if (!location.search.includes('type=content')) return;
        document.querySelectorAll('.Card.SearchResult-Card[data-za-detail-view-path-module="AnswerItem"], .Card.SearchResult-Card[data-za-detail-view-path-module="PostItem"]').forEach(card => {
            const nameEl = card.querySelector('.RichText.ztext.CopyrightRichText-richText b');
            if (nameEl && userBlocked(nameEl.textContent)) card.hidden = true;
        });
    };
    setTimeout(scan, 2000);
    window.addEventListener('urlchange', () => setTimeout(scan, 1000));
    observeTree(mutations => {
        if (!location.search.includes('type=content')) return;
        forAddedElements(mutations, target => {
            const nameEl = target.querySelector('.Card.SearchResult-Card[data-za-detail-view-path-module="AnswerItem"] .RichText.ztext.CopyrightRichText-richText b, .Card.SearchResult-Card[data-za-detail-view-path-module="PostItem"] .RichText.ztext.CopyrightRichText-richText b');
            if (nameEl && userBlocked(nameEl.textContent)) target.hidden = true;
        });
    });
}

export function blockUsersComment() {
    observeTree(mutations => {
        forAddedElements(mutations, target => {
            const item = target.querySelector('img.Avatar[width="24"]');
            if (item && userBlocked(item.alt) && item.parentElement && item.parentElement.parentElement) {
                item.parentElement.parentElement.style.display = 'none';
            }
        });
    });
}

export function blockUsersHoverButton() {
    observeTree(mutations => {
        forAddedElements(mutations, target => {
            const cn = typeof target.className === 'string' ? target.className : '';
            const hit = cn.includes('Popover-content Popover-content--top HoverCard-popoverTarget') ||
                cn.includes('Popover-content Popover-content--bottom HoverCard-popoverTarget') ||
                target.querySelector('.Popover-content.Popover-content--top.HoverCard-popoverTarget') ||
                target.querySelector('.Popover-content.Popover-content--bottom.HoverCard-popoverTarget');
            if (!hit) return;
            const item = target.querySelector('.MemberButtonGroup.ProfileButtonGroup.HoverCard-buttons');
            const link = target.querySelector('a.UserLink-link');
            if (!item || !link || target.querySelector('button[data-name][data-userid]')) return;
            const name = link.textContent;
            const userid = link.href.split('/')[4];
            item.insertAdjacentHTML('beforeend', blockUserButtonHtml(name, userid, 'width: 100%;margin: 7px 0 0 0;', '屏蔽用户'));
            item.lastElementChild.onclick = function () {
                blockUsersAdd(this.dataset.name, this.dataset.userid, false);
            };
        });
    });
}

export function blockUserButtonHtml(name, userid, style, text) {
    return `<button type="button" data-name="${name}" data-userid="${userid}" class="Button FollowButton Button--primary Button--red" style="${style}"><span style="display: inline-flex; align-items: center;">​<svg class="Zi Zi--Plus FollowButton-icon" fill="currentColor" viewBox="0 0 24 24" width="1.2em" height="1.2em"><path d="M18.376 5.624c-3.498-3.499-9.254-3.499-12.752 0-3.499 3.498-3.499 9.254 0 12.752 3.498 3.499 9.254 3.499 12.752 0 3.499-3.498 3.499-9.14 0-12.752zm-1.693 1.693c2.37 2.37 2.596 6.094.678 8.69l-9.367-9.48c2.708-1.919 6.32-1.58 8.69.79zm-9.48 9.48c-2.37-2.37-2.595-6.095-.676-8.69l9.48 9.48c-2.822 1.918-6.433 1.58-8.803-.79z" fill-rule="evenodd"></path></svg></span>${text}</button>`;
}

export function blockUsersButtonPeople() {
    const item = document.querySelector('.MemberButtonGroup.ProfileButtonGroup.ProfileHeader-buttons');
    const nameEl = document.querySelector('.ProfileHeader-name');
    if (!item || !nameEl) return;
    const name = nameEl.firstChild && nameEl.firstChild.textContent;
    const userid = location.href.split('/')[4];
    if (userBlocked(name)) {
        document.querySelectorAll('.Button.Button--primary.Button--red').forEach(btn => { btn.style.display = 'none'; });
        item.insertAdjacentHTML('beforeend', blockUserButtonHtml(name, userid, 'margin: 0 0 0 12px;', '取消屏蔽'));
        item.lastElementChild.onclick = function () {
            blockUsersDel(this.dataset.name, this.dataset.userid, true);
        };
        return;
    }
    item.insertAdjacentHTML('beforeend', blockUserButtonHtml(name, userid, 'margin: 0 0 0 12px;', '屏蔽用户'));
    item.lastElementChild.onclick = function () {
        blockUsersAdd(this.dataset.name, this.dataset.userid, true);
    };
}

export function blockUsersAdd(name, userid, reload) {
    if (!name || !userid) return;
    const users = menuValue('menu_customBlockUsers') || [];
    const off = readListOff('menu_customBlockUsers');
    if (users.includes(name)) {
        if (off.has(name)) {
            off.delete(name);
            writeListOff('menu_customBlockUsers', off);
            notify('已重新启用对该用户的屏蔽~\n刷新网页后生效~');
            if (reload) setTimeout(() => location.reload(), 200);
            return;
        }
        notify('该用户已经被屏蔽啦，无需重复屏蔽~');
        return;
    }
    users.push(name);
    menuSet('menu_customBlockUsers', users);
    GM_xmlhttpRequest({ url: `https://www.zhihu.com/api/v4/members/${userid}/actions/block`, method: 'POST', timeout: 2000 });
    if (reload) setTimeout(() => location.reload(), 200);
    else notify('该用户已被屏蔽~\n刷新网页后生效~');
}

export function blockUsersDel(name, userid, reload) {
    if (!name || !userid) return;
    const users = menuValue('menu_customBlockUsers') || [];
    const index = users.indexOf(name);
    if (index < 0) {
        notify('没有在屏蔽列表中找到该用户...');
        return;
    }
    if (isPackedListItem('menu_customBlockUsers', name)) {
        const off = readListOff('menu_customBlockUsers');
        off.add(name);
        writeListOff('menu_customBlockUsers', off);
    } else {
        users.splice(index, 1);
        const off = readListOff('menu_customBlockUsers');
        off.delete(name);
        menuSet('menu_customBlockUsers', users);
        writeListOff('menu_customBlockUsers', off);
    }
    GM_xmlhttpRequest({ url: `https://www.zhihu.com/api/v4/members/${userid}/actions/block`, method: 'DELETE', timeout: 2000 });
    if (reload) setTimeout(() => location.reload(), 200);
    else notify('该用户已取消屏蔽啦~\n刷新网页后生效~');
}
