// ==UserScript==
// @name        Snahpify
// @version     1.0.0
// @description Snahp Post Generator
// @author      3ncode3
// @include     /^https?:\/\/forum\.snahp\.it\/posting\.php\?mode\=post\&f\=(42|55|26|29|66|30|88|56|72|73|64|31|32|65|84|33|61|62|57|74|75)/
// @require     https://code.jquery.com/jquery-3.4.1.min.js
// @require     https://code.jquery.com/ui/1.12.1/jquery-ui.js
// @require     https://raw.githubusercontent.com/Semantic-Org/UI-Search/master/search.js
// @require     https://raw.githubusercontent.com/Semantic-Org/UI-Api/master/api.js
// @grant       GM_addStyle
// @grant       GM_xmlhttpRequest
// @grant       GM_setClipboard
// @grant       GM.setValue
// @grant       GM.getValue
// ==/UserScript==

;(function () {
  // Hide on preview
  if (window.location.href.includes('preview')) return

  const SNAHP_LINKS = 'https://links.snahp.it/index.php'
  const YEAR_REGEX = /^\d{4}$/g
  const URL_REGEX = /(https?:[^\s]+)/
  const DELIMETER_REGEX = /\s+/ // spaces
  const htmlTemplate = `
    <br/>
    <br/>

    <dr style="clear: left;" id="SnahpifyHeader">

    <dt> <label for="sp-toggle">SNAHPIFY</label> </dt>
    <dd> <span name="sp-toggle" id="sp-toggle" class="pointer noselect">Hide</span></dd>

    </dr>

    <br/>

    <dr style="clear: left;" id="Snahpify">

    <dt> <label for="screenlinks">Screenshot Links:</label> </dt>
    <dd> <input type="text" name="screenslinks" id="screenslinks" class="inputbox autowidth" size="45"></input> </dd>

    <dt> <label for="mega">MEGA Link:</label> </dt>
    <dd> <input type="text" name="mega" class="sp-links inputbox autowidth" size="45" data-color="#FF0000"></input> </dd>

    <dt> <label for="zippy">ZippyShare Link:</label> </dt>
    <dd> <input type="text" name="zippy" class="sp-links inputbox autowidth" size="45" data-color="#FFFF00"></input> </dd>

    <dt> <label for="gdrive">Google Drive Link:</label> </dt>
    <dd> <input type="text" name="gdrive" class="sp-links inputbox autowidth" size="45" data-color="#00FF00"></input> </dd>

    <dt> <label for="linkpro">Link Protector:</label> </dt>
    <dd> <input type="checkbox" name="linkpro" id="linkpro" class="inputbox autowidth" size="45">Use</input> </dd>

    <dt> <label for="linkpro-pass">Link Protector Password:</label> </dt>
    <dd> <input type="text" name="linkpro-pass" id="linkpro-pass" class="inputbox autowidth" size="45" placeholder="Leave blank for no password"></input> </dd>

    <dt> <label for="mediainfo">Mediainfo:</label> </dt>
    <dd> <textarea rows="1" name="mediainfo" id="mediainfo" size="45" class="inputbox autowidth" style="width: 100%;"></textarea> </dd>

    <dd>
    <button class="button--primary button button--icon" id="sp-generate" type="button">Generate Post</button>
    &nbsp;
    <button class="button--primary button button--icon" id="sp-clear" type="reset">Clear</button>
    </dd>

    <br/>

    </dr>

    <br/>
    `

  const htmlpush = document.getElementsByTagName('dl')[0]
  htmlpush.innerHTML += htmlTemplate

  const titlechange = document.getElementById('title')
  if (titlechange) {
    document.getElementById('title').className += 'input'
  }

  const snahpPoster = $('#Snahpify'),
    spToggleBtn = $('#sp-toggle'),
    spGenBtn = $('#sp-generate'),
    subject = $('#subject'),
    message = $('#message')

  subject.attr('placeholder', 'Leave blank to generate it from mediainfo')

  spToggleBtn.click(() => togglePoster())
  spGenBtn.click(() => generateTemplate())

  function togglePoster () {
    spToggleBtn.text(spToggleBtn.text() === 'Hide' ? 'Show' : 'Hide')
    snahpPoster.toggle()
  }

  function genProtectedLink (link, password = '') {
    let protected = link

    $.ajax({
      type: 'POST',
      url: SNAHP_LINKS,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      contentType: 'application/x-www-form-urlencoded; charset=utf-8',
      dataType: 'xml',
      data: {
        information: link,
        pass: password,
        R2: 'V4',
        submit: 'Create Protected Links!'
      },
      success: function (xml) {
        console.log(xml)
        var urlEl = $(xml)
          .find('div.success')
          .first()
          .text()

        console.log(urlEl)

        if (!urlEl) return

        let linkMatch = urlEl.match(URL_REGEX)

        console.log(linkMatch)

        if (linkMatch) protected = linkMatch[1]
      },
      error: function (ajaxContext) {
        console.error(ajaxContext.responseText)
      },
      async: false
    })

    return protected
  }

  function generateTemplate () {
    var screenslinks = $('#screenslinks')
        .val()
        .trim(),
      links = $('.sp-links'),
      useLinkPro = $('#linkpro').is(':checked'),
      linkProPass = $('#linkpro-pass').val(),
      mediainfo = $('#mediainfo').val(),
      post = ''

    links = links.filter(function () {
      return this.value.length !== 0
    })

    // Add screenshots
    if (screenslinks) {
      slinks = screenslinks.split(DELIMETER_REGEX)
      post += `\n
        [hr][/hr]
        [size=150][color=#FF8000][b]Screenshots[/b][/color][/size]\n\n
        `
      slinks.forEach(link => {
        post += `[img]${link}[/img]`
      })
      post += `\n`
    }

    // Add mediainfo
    if (mediainfo) {
      console.log(mediainfo)
      post += `
        [hr][/hr]
        [size=150][color=#FF8000][b]Media Info[/b][/color][/size]\n\n
        [mediainfo]${mediainfo}[/mediainfo]
        \n`
    }

    // Add the download links
    if (links.length !== 0) {
      let postLinks = links
        .map(function () {
          let link = $(this)
          let url = link.val()
          console.log('useLinkPro', useLinkPro)

          if (useLinkPro) {
            console.log('Is link pro', url)
            url = genProtectedLink(url, linkProPass)
          }
          return `[url=${url}][color=${link.data('color')}]${link.attr('name').toUpperCase()}[/color][/url]`
        })
        .get()
        .join('\n')

      post += `
        [hr][/hr]
        [center][size=150][color=#FF8000][b]Download Link[/b][/color][/size]\n
          [hide][b]${postLinks}[/b][/hide]\n\n
          Hit Reputation 🏆  if this helped 🙏
        [/center]
        `
    }

    // Generate subject
    if (mediainfo && !subject.val()) {
      let miRows = mediainfo.split('\n')
      let fNameStr = miRows.find(e => e.includes('Complete name'))
      let fSizeStr = miRows.find(e => e.includes('File size'))
      let fName = fNameStr && fNameStr.split(' : ')[1]
      if (fName.includes('/')) {
        fName = fName.split('/')[1]
      }
      fName = fName.split(/[\.\-]/g)
      let fSize = fSizeStr && fSizeStr.split(' : ')[1].replace(/i/g, '')
      // Remove file extension
      fName.pop()
      let yrIdx = fName.findIndex(e => YEAR_REGEX.test(e))
      let yr = fName[yrIdx]
      let title = fName.slice(0, yrIdx).join(' ')
      // Get IMDB url
      // let query = `https://www.omdbapi.com/?apikey=${API_KEY}&r=JSON&s=${title}&y=${yr}`;
      // let imdbQuery = $.ajax({ url: query, dataType: 'jsonp' })
      // imdbQuery.done(function (res) {
      //   console.log('Got imdb:', res)
      //   if (res.Response !== "True") return
      //   Imdb.fillPostMessage(res.imdbID)
      // })
      fName[yrIdx] = '(' + fName[yrIdx] + ')'
      fName = fName.join(' ')
      let hosts = links
        .map(function () {
          let link = $(this)
          return `[${link.attr('name').toUpperCase()}]`
        })
        .get()
        .join('')
      let postSubject = `${hosts} ${fName} [${fSize}]`

      // Trigger IMDb search for title
      let iSearch = $('#imdb_terms_crispy')
      iSearch.val(title)
      iSearch
        .parent()
        .parent()
        .find('button')
        .click()

      // Set new subject
      subject.val(postSubject)
    }

    // Create post
    try {
      console.log(post)
      message.val(post)
    } catch (err) {
      alert('Something went wrong ☹️' + err)
    }
  }

  //--- CSS styles make it work...
  GM_addStyle(
    `
    @media screen and (min-width: 300px) {
      .inputbox {
          max-width: 330px;
      }

      .result {
          max-height: 10px;
          display: unset;
      }

      .content {
          overflow: unset;
          min-height: unset;
          cursor: pointer;
          padding-bottom: unset;
          line-height: unset;
      }

      dd input ::placeholder {
        opacity: 0.5;
      }

      #Snahpify dd {
        margin-bottom: 3px;
      }
  }
  `
  )
})()
