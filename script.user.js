// ==UserScript==
// @name        Snahpify
// @version     1.0.0
// @description Snahp Post Generator
// @author      3ncode3
// @include     /^https?:\/\/forum\.snahp\.it\/posting\.php\?mode\=post\&f\=(42|55|26|29|66|30|88|56|72|73|64|31|32|65|84|33|61|62|57|74|75)/
// @require     https://code.jquery.com/jquery-3.4.1.min.js
// @require     https://greasemonkey.github.io/gm4-polyfill/gm4-polyfill.js
// @grant       GM_addStyle
// @grant       GM_xmlhttpRequest
// ==/UserScript==

;(async function () {
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

    <dt> <label for="banner">Banner:</label> </dt>
    <dd> <input type="text" name="banner" id="banner" class="inputbox autowidth" size="45"></input> </dd>

    <dt> <label for="screenslinks">Screenshot Links:</label> </dt>
    <dd> <input type="text" name="screenslinks" id="screenslinks" class="inputbox autowidth" size="45" placeholder="Space-separated links"></input> </dd>

    <dt> <label for="mega">MEGA Link:</label> </dt>
    <dd> <input type="text" name="mega" class="sp-links inputbox autowidth" size="45" data-color="#FF0000"></input> </dd>

    <dt> <label for="zippy">ZippyShare Link:</label> </dt>
    <dd> <input type="text" name="zippy" class="sp-links inputbox autowidth" size="45" data-color="#FFFF00"></input> </dd>

    <dt> <label for="gdrive">Google Drive Link:</label> </dt>
    <dd> <input type="text" name="gdrive" class="sp-links inputbox autowidth" size="45" data-color="#00FF00"></input> </dd>
    
    <div class="sp-section"></div>
    
    <dt> <label for="linkpro">Link Protection:</label> </dt>
    <dd> 
      <input type="checkbox" name="linkpro" id="linkpro" class="inputbox autowidth" size="45">Snahp Link Protector</input>
      <input type="checkbox" name="base64" id="base64" class="inputbox autowidth" size="45">Base 64</input>
    </dd>

    <dt> <label for="base64-iters">Base64 iterations:</label> </dt>
    <dd> <input type="number" name="base64-iters" id="base64-iters" class="inputbox autowidth" size="45" min="1" value="1"></input> </dd>

    <dt> <label for="linkpro-pass">Link Password:</label> </dt>
    <dd> <input type="text" name="linkpro-pass" id="linkpro-pass" class="inputbox autowidth" size="45" placeholder="Leave blank for no password"></input> </dd>

    <dt> <label for="linkpro-pass-hint">Link Password Hint:</label> </dt>
    <dd> <input type="text" name="linkpro-pass-hint" id="linkpro-pass-hint" class="inputbox autowidth" size="45" placeholder="Password is ..."></input> </dd>

    <div class="sp-section"></div>

    <dt> <label for="mediainfo">Mediainfo:</label> </dt>
    <dd> <textarea rows="1" name="mediainfo" id="mediainfo" size="45" class="inputbox autowidth" style="width: 100%;"></textarea> </dd>

    <div class="sp-section"></div>

    <dd>
    <button class="button--primary button button--icon" id="sp-generate" type="button">SNAHPIFY</button>
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

  function serialize (obj) {
    let str = Object.keys(obj)
      .reduce(function (a, k) {
        a.push(k + '=' + encodeURIComponent(obj[k]))
        return a
      }, [])
      .join('&')
    return str
  }

  function toB64 (str, iters = 1) {
    for (let i = 1; i <= iters; i++) {
      str = window.btoa(str)
    }

    return str
  }

  function genProtectedLink (link, password = '') {
    let protected = link

    GM_xmlhttpRequest({
      method: 'POST',
      url: SNAHP_LINKS,
      data: serialize({
        information: link,
        pass: password,
        R2: 'V4',
        submit: 'Create Protected Links!'
      }),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      onload: function (response) {
        console.log('response', response)

        var urlEl = $(response.responseText)
          .find('div.success')
          .first()
          .text()

        console.log(urlEl)

        if (!urlEl) return

        let linkMatch = URL_REGEX.exec(urlEl)

        console.log('match', linkMatch)

        if (linkMatch) {
          protected = linkMatch[0]
        }
      }
    })

    return protected
  }

  function generateTemplate () {
    var banner = $('#banner')
        .val()
        .trim(),
      screenslinks = $('#screenslinks')
        .val()
        .trim(),
      links = $('.sp-links'),
      useLinkPro = $('#linkpro').is(':checked'),
      encodeB64 = $('#base64').is(':checked'),
      B64Iters = parseInt($('#base64-iters').val()),
      linkProPass = $('#linkpro-pass')
        .val()
        .trim(),
      linkProPassHint = $('#linkpro-pass-hint')
        .val()
        .trim(),
      mediainfo = $('#mediainfo')
        .val()
        .trim(),
      post = ''

    links = links.filter(function () {
      return this.value.length !== 0
    })

    if (banner) {
      post += `[banner]${banner}[/banner]`
    }

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

    // Add the download links
    if (links.length !== 0) {
      let postLinks = links
        .map(function () {
          let link = $(this)
          let url = link.val()
          let host = link.attr('name').toUpperCase()
          let color = link.data('color')
          let postLink = ''

          if (encodeB64) {
            url = toB64(url, B64Iters || 1)
            postLink = `[color=${color}]${host}: ${url}[/color]`
          }

          if (useLinkPro) {
            console.log('Link pro url', url)
            url = genProtectedLink(url, linkProPass)
            console.log('Protected link', url)
            postLink = `[url=${url}][color=${color}]${host}[/color][/url]`
          }

          return postLink
        })
        .get()
        .join('\n')

      post += `
            [hr][/hr]
            [center][size=150][color=#FF8000][b]Download Link[/b][/color][/size]\n
              [hide][b]${postLinks}[/b][/hide]\n
            [/center]
            `

      if (linkProPassHint) {
        post += `\n
              [center]
                [size=125][b][i][color=#fac51c]Password is ${linkProPassHint}[/color][/i][/b][/size]
              [/center]
              `
      }
    }

    // Create post
    try {
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

      dd input::placeholder {
        opacity: 0.5;
      }

      #Snahpify dd {
        margin-bottom: 6px;
      }

      #Snahpify input[type='checkbox'] + input[type='checkbox'] {
        margin-left: 12px;
      }

      #Snahpify .sp-section {
        margin-top: 12px;
      }
  }
  `
  )
})()
