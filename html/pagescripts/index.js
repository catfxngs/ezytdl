let config;

configuration.get().then(newConf => {
    config = newConf
})

const mainContainer = document.getElementById(`mainContainer`);

const searchBoxHeights = () => [`${window.innerHeight - 80}px`, `225px`]

const urlBox = document.getElementById(`urlBox`);

const background = document.getElementById(`background`);

const input = document.getElementById(`urlInput`);
const button = document.getElementById(`urlEnter`);

const formatListTemplate = listbox.querySelector(`#formatList`).cloneNode(true);
const formatCard = document.getElementById(`formatCard`).cloneNode(true);

const listboxTemplate = document.getElementById(`listbox`).cloneNode(true);
const listboxParent = document.getElementById(`listbox`).parentElement;

listboxTemplate.querySelector(`#formatCard`).parentElement.removeChild(listboxTemplate.querySelector(`#formatCard`));

listboxParent.removeChild(document.getElementById(`listbox`));

let currentInfo = null;

mainQueue.formatStatusUpdate((content) => document.getElementById(`statusText`).innerHTML = content)

const runSearch = async (url) => {
    document.getElementById(`statusText`).innerHTML = `Fetching info...`;
    if(document.getElementById(`statusText`).classList.contains(`d-none`)) document.getElementById(`statusText`).classList.remove(`d-none`);

    console.log(`running search for ${url}`)

    const centerURLBox = (removeListbox, checkParse) => {
        document.body.style.overflowY = `hidden`;

        window.scrollTo(0, 0);

        anime({
            targets: urlBox,
            height: searchBoxHeights().reverse(),
            duration: 600,
            easing: `easeOutExpo`,
            complete: () => {
                if(document.getElementById(`listbox`)) listboxParent.removeChild(document.getElementById(`listbox`));

                urlBox.style.height = `calc(100vh - 80px)`
                
                if(checkParse) {
                    if(parse) {
                        parseInfo();
                    } else {
                        parse = true;
                    }
                }
            }
        });
    }

    let info = null;

    const parseInfo = async () => {
        const listbox = listboxTemplate.cloneNode(true);
        
        if(listbox.classList.contains(`d-none`)) listbox.classList.remove(`d-none`);

        listboxParent.appendChild(listbox);
        
        const formatList = listbox.querySelector(`#formatList`);
        
        input.disabled = false;
        button.disabled = false;

        currentInfo = info;
        
        document.body.style.overflowY = `scroll`;

        if(info.error) {
            document.getElementById(`errorMsg`).innerHTML = info.error;

            if(document.getElementById(`errorMsg`).classList.contains(`d-none`)) {
                document.getElementById(`errorMsg`).classList.remove(`d-none`);
            };

            return;
        } else {
            anime({
                targets: urlBox,
                height: searchBoxHeights(),
                duration: 1000,
                easing: `easeOutExpo`,
            });

            listbox.querySelector(`#mediaTitle`).innerHTML = `[${info.webpage_url_domain}] ${info.title}`;

            if(info.thumbnails && info.thumbnails.length > 0) {
                const thumbnail = info.thumbnails[info.thumbnails.length - 1];

                console.log(`thumbnail:`, thumbnail);

                const img = new Image();

                img.addEventListener(`load`, () => {
                    if(currentInfo.webpage_url == info.webpage_url) {
                        document.getElementById(`background`).style.backgroundImage = `url(${thumbnail.url})`;

                        anime.remove(background)

                        anime({
                            targets: background,
                            opacity: [0, 0.15],
                            duration: 1000,
                            easing: `easeOutQuad`
                        })
                    }
                });

                img.src = thumbnail.url;
            }

            console.log(info)

            let currentSelected = null;
            
            qualityButtons({ card: listbox, node: listbox.querySelector(`#qualityButtons`), info, centerURLBox: info.entries ? centerURLBox : () => {} });

            if(info.entries) {
                for (const entry of info.entries) {
                    const card = formatCard.cloneNode(true);

                    card.querySelector(`#formatMetaList`).classList.add(`d-none`);

                    card.querySelector(`#buttonsDiv`).style.minHeight = `36px`;

                    card.querySelector(`#mediaIcons`).style.width = `24px`
                    card.querySelector(`#mediaIcons`).style.minWidth = `24px`
                    card.querySelector(`#mediaIcons`).style.maxWidth = `24px`

                    card.querySelector(`#audioIcon`).classList.add(`d-none`);
                    card.querySelector(`#videoIcon`).classList.add(`d-none`);
                    card.querySelector(`#fileIcon`).classList.remove(`d-none`);

                    if(!entry.title) entry.title = entry.webpage_url;
                    if(!entry.title) entry.title = entry.url;

                    card.querySelector(`#formatName`).innerHTML = entry.title;

                    if(entry.duration) {
                        card.querySelector(`#fileFormat`).innerHTML = `${entry.duration.timestamp}`;
                    } else {
                        card.querySelector(`#fileFormat`).classList.add(`d-none`)
                    }

                    //card.querySelector(`#saveOptions`).innerHTML = ``;

                    const newDiv = listbox.querySelector(`#qualityButtons`).cloneNode(true);

                    newDiv.style.padding = `0px`;
                    newDiv.style.minWidth = `100%`;
                    newDiv.style.removeProperty(`background`);

                    card.querySelector(`#formatDownload`).classList.add(`d-none`)

                    const innerQualityButtons = newDiv.querySelector(`#innerQualityButtons`);

                    innerQualityButtons.style.minWidth = `100%`;

                    card.appendChild(newDiv)

                    qualityButtons({ node: card, info: entry, card })

                    formatList.appendChild(card);

                    await new Promise((resolve) => setTimeout(resolve, 1));
                }
            } else if(info.formats) {
                /*document.getElementById(`qualityButtons`).querySelectorAll(`.btn`).forEach((btn, i) => {
                    btn.onclick = () => {
                        btn.disabled = true;
                        btn.opacity = 0.5;
                        
                        startDownload(btn, {
                            url: url,
                            format: qualities[i],
                            info: Object.assign({}, info, { formats: null }),
                        });
                    }
                });*/
                
                qualityButtons({ node: listbox, info });

                info.formats = info.formats.map(format => {
                    if(format.audio_ext != `none` || format.acodec != `none` || format.asr || format.audio_channels) {
                        format.audio = true;
                    } else {
                        format.audio = false;
                    }

                    if(format.aspect_ratio || format.fps || format.height || format.width || format.resolution != `audio only` || format.vcodec != `none` || format.video_ext != `none`) {
                        format.video = true;
                    } else {
                        format.video = false;
                    };

                    return format;
                }).sort((a, b) => {
                    if(a.audio && a.video) {
                        return -1;
                    } else if(b.audio && b.video) {
                        return 1;
                    } else if(a.audio && !a.video) {
                        return -1;
                    } else if(b.audio && !b.video) {
                        return 1;
                    } else if(a.video && !a.audio) {
                        return -1;
                    } else if(b.video && !b.audio) {
                        return 1;
                    } else {
                        return 0;
                    }
                });

                if(info.formats.filter(f => f.audio).length == 0) document.getElementById(`downloadBestAudio`).classList.add(`d-none`);
                if(info.formats.filter(f => f.video).length == 0) document.getElementById(`downloadBestVideo`).classList.add(`d-none`);

                /*let qualities = [`bv*+ba/b`, `ba`, `bv`]

                listbox.querySelector(`#qualityButtons`).querySelectorAll(`.btn`).forEach((btn, i) => {
                    btn.onclick = () => {
                        btn.disabled = true;
                        btn.opacity = 0.5;
                        
                        startDownload(btn, {
                            url: url,
                            format: qualities[i],
                            info: Object.assign({}, info, { formats: null }),
                        });
                    }
                });*/
                
                for (const format of info.formats) {
                    //console.log(format)
                    const formatDownloadType = format.audio && format.video ? `both` : format.audio && !format.video ? `audio` : `video`;

                    const card = formatCard.cloneNode(true);

                    const saveOptions = listboxTemplate.querySelector(`#saveOptions`).cloneNode(true)

                    card.appendChild(saveOptions)

                    const formatName = card.querySelector(`#formatName`);
                    const formatSubtext = card.querySelector(`#formatSubtext`);

                    const list = card.querySelector(`#formatMetaList`);

                    const listMetaItems = {
                        video: list.querySelector(`#formatMetaVideoItem`).cloneNode(true),
                        audio: list.querySelector(`#formatMetaAudioItem`).cloneNode(true)
                    }

                    list.querySelector(`#formatMetaVideoItem`).remove();
                    list.querySelector(`#formatMetaAudioItem`).remove();

                    const tags = formatToTags(format)

                    formatName.innerHTML = tags.format;
                    if(tags.filesize) format.innerHTML += ` (${tags.filesize})`;
                    if(tags.drm) format.innerHTML += ` (DRM)`;

                    for (type of Object.keys(tags.meta)) {
                        console.log(`appending ${type} meta for ${tags.format}`)

                        if(listMetaItems[type]) {
                            for (key of Object.keys(tags.meta[type])) {
                                if(tags.meta[type][key] != `none`) {
                                    console.log(`appending ${key} meta with value ${tags.meta[type][key]}`)

                                    const item = listMetaItems[type].cloneNode(true);

                                    item.querySelector(`#txt`).innerHTML = key + `: ` + tags.meta[type][key];

                                    list.appendChild(item);
                                }
                            }
                        } else {
                            console.log(`no ${type} list item found`)
                        }
                    };

                    if(tags.extra.length > 0) {
                        card.querySelector(`#formatTags`).classList.remove(`d-none`);
                        card.querySelector(`#formatTags`).innerHTML = tags.extra.join(` | `);
                    }

                    card.querySelector(`#fileFormat`).innerHTML = format.ext;

                    if(format.audio) {
                        card.querySelector(`#audioIcon`).style.opacity = `100%`;
                    } else {
                        card.querySelector(`#audioIcon`).style.opacity = `35%`;
                    }

                    if(format.video) {
                        card.querySelector(`#videoIcon`).style.opacity = `100%`;
                        //card.querySelector(`#formatConversionTextbox`).classList.add(`d-none`);
                    } else {
                        card.querySelector(`#videoIcon`).style.opacity = `35%`;
                    }

                    card.querySelector(`#formatConversionTextbox`).placeholder = `${format.ext}`;
                    card.querySelector(`#saveLocation`).value = `${config && config.saveLocation ? config.saveLocation : `{default save location}`}`;

                    if(config.lastMediaConversionOutputs[formatDownloadType]) card.querySelector(`#formatConversionTextbox`).value = config.lastMediaConversionOutputs[formatDownloadType];

                    const saveOptionsIcon = card.querySelector(`#downloadicon`)

                    const btn = card.querySelector(`#formatDownload`);
                    
                    const confirmDownload = () => {
                        saveOptionsAnimations.fadeOut(btn, saveOptions, btnClick);

                        btn.disabled = true;

                        const bar = card.querySelector(`#progressBar`);
                        const fill = card.querySelector(`#progressFill`);

                        if(card.querySelector(`#formatConversionTextbox`).value != config.lastMediaConversionOutputs[formatDownloadType]) {
                            let j = {};

                            j[formatDownloadType] = card.querySelector(`#formatConversionTextbox`).value;
                        }

                        const dotSize = Number.parseInt(fill.style.width.replace(`px`, ``));
                        const range = Number.parseInt(bar.style.width.replace(`px`, ``)) - dotSize;

                        card.style.opacity = 0.5;

                        console.log(format.format_id)

                        startDownload(card, {
                            url: url,
                            format: format.format_id,
                            ext: card.querySelector(`#formatConversionTextbox`).value || null,
                            filePath: card.querySelector(`#saveLocation`).value || null,
                            info: Object.assign({}, info, { formats: null }),
                        });
                    }

                    card.querySelector(`#confirmDownload`).onclick = () => confirmDownload();

                    const btnClick = () => {
                        if(saveOptions.classList.contains(`d-none`)) {
                            saveOptionsAnimations.fadeIn(btn, saveOptions, btnClick);
                        } else {
                            saveOptionsAnimations.fadeOut(btn, saveOptions, btnClick);
                        }
                    }

                    btn.onclick = () => btnClick()

                    formatList.appendChild(card);

                    await new Promise((resolve) => setTimeout(resolve, 1));
                }
            }
        }
    }

    let parse = false;

    mainQueue.getInfo(url).then(data => {
        info = data;

        if(parse) {
            parseInfo();
        } else {
            parse = true;
        }
    })
    
    input.disabled = true;
    button.disabled = true;

    if(!document.getElementById(`errorMsg`).classList.contains(`d-none`)) {
        document.getElementById(`errorMsg`).classList.add(`d-none`);
    }

    if(document.getElementById(`listbox`)) {
        centerURLBox(true, true);

        anime.remove(background)

        anime({
            targets: background,
            opacity: [0.15, 0],
            duration: 500,
            easing: `easeOutExpo`
        })
    } else if(parse) {
        parseInfo();
    } else {
        parse = true;
    }
}

const processURL = () => {
    const url = input.value;

    console.log (`clicc`, url)

    const genericUrlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;

    const match = url.match(genericUrlRegex);

    console.log (`match`, match)

    if(match) runSearch(url)
}

button.onclick = () => processURL();

input.addEventListener(`keyup`, (e) => {
    if(e.key == `Enter` || e.keyCode == 13) processURL();
});

changelog.check();