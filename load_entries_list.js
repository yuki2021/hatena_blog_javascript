// Config
const config = {
    numEntries: 5,
    apiUrlPopular: "https://yuki2021.sakura.ne.jp/hatena_rss/rss.php",
    apiUrlNew: "https://www.ituki-yu2.net/rss",
    noImage: 'https://cdn.blog.st-hatena.com/images/theme/og-image-1500.png',
};

$(document).ready(function () {
    loadEntries(config.apiUrlPopular, 'popular_entries_feed', createPopularEntriesHtml);
    loadEntries(config.apiUrlNew, 'new_entries_feed', createNewEntriesHtml);
});

function loadEntries(apiUrl, elementId, createHtmlFunction) {
    $.ajax({
        url: apiUrl,
        type: 'get',
        dataType: 'xml',
        timeout: 50000,
        success: function(xml) {
            const data = parseXml(xml);
            const html = createHtmlFunction(data);
            $(`#${elementId}`).html(html);
        },
        error: function(xhr, textStatus, errorThrown){
            console.log('Error! ' + textStatus + ' ' + errorThrown);
        }
    });
}

function parseXml(xml) {
    let row = 0;
    const data = [];
    let nodeName;

    $(xml).find('item').each(function() {
        if(row >= config.numEntries){
            return false;
        }

        data[row] = {};
        $(this).children().each(function() {
            nodeName = $(this)[0].nodeName;
            data[row][nodeName] = {};

            const attributes = $(this)[0].attributes; 
            for (let i in attributes) {
                data[row][nodeName][attributes[i].name] = attributes[i].value;
            }
            data[row][nodeName]['text'] = $(this).text();
        });
        row++;
    });

    return data;
}

function createPopularEntriesHtml(data) {
    let useFeed = "";
    for (let i in data) {
        useFeed += `
        <div class="htbl_popular_entry">
            <a href="${data[i].link.text}">
                <img class="htbl_popular_entry_img" src="${getPicPopuler(data[i]['content:encoded'].text)}">
                <div class="htbl_popular_entry_text">
                    <span class="entry_title">${data[i].title.text}</span>
                    <span class="entry_hatebu">
                        <img src="https://b.hatena.ne.jp/entry/image/${data[i].link.text}">
                    </span>
                    <span class="entry_date">${dateFormat(data[i]['dc:date'].text)}</span>
                    <div class="htbl_popular_entry_count">
                        <span class="count">${parseInt(i)+1}</span>
                    </div>
                </div>
            </a>
        </div>`;
    }
    return `<div class="htbl_popular_entries">${useFeed}</div>`;
}

function createNewEntriesHtml(data) {
    let useFeed = "";
    for (let i in data) {
        useFeed += `
        <div class="htbl_new_entry">
            <a href="${data[i].link.text}">
                <img class="htbl_new_entry_img" src="${getPicNew(data[i].description.text)}">
                <div class="htbl_new_entry_text">
                    <span class="entry_title">${data[i].title.text}</span>
                    <span class="entry_date">${dateFormat(data[i].pubDate.text)}</span>
                </div>
            </a>
        </div>`;
    }
    return `<div class="htbl_new_entries">${useFeed}</div>`;
}

function dateFormat(str){
    const my_date = new Date(str);
    return `${my_date.getMonth() + 1}月${my_date.getDate()}日`;
}

// はてぶがついた記事の画像を取得
function getPicPopuler(str) {
    const format_arr = str.match(/http(?:s|):{1}[\S]+\.(?:jpg|gif|png)/);
    if(format_arr && format_arr[0] != 'http://b.hatena.ne.jp/images/append.gif') {
        let return_str;
        if(format_arr[0].match('/cdn-ak-scissors.b.st-hatena.com/')) {
            const url_split_temp_arr = format_arr[0].split('/');
            const url_last_item = url_split_temp_arr.slice(-1);
            return_str = decodeURIComponent(url_last_item[0]);
        } else {
            return_str = format_arr[0].replace(/(\.[^.]+$)/ , "_l$1");
        }
        return_str = return_str.replace('http://ecx.', 'https://images-fe.ssl-');
        return return_str;
    } 
    return config.noImage;
}

// 新着画像の取得
function getPicNew(str) {
  var no_image = 'https://cdn.blog.st-hatena.com/images/theme/og-image-1500.png';
  format_str = (str.match(/http(?:s|):{1}[\S_-]+\.(?:jpg|gif|png)/) != null) ? str.match(/http(?:s|):{1}[\S_-]+\.(?:jpg|gif|png)/) : no_image.match(/http(?:s|):{1}[\S_-]+\.(?:jpg|gif|png)/)
  return format_str;
};