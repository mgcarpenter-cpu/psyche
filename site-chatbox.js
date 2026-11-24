/* ==========================================================================
   Sussuri: the one typing box (site walk fixes, 24 Nov 2026)
   The Chat page's typing box, for every other place Sussuri chats: the same size, the microphone
   (the browser turns speech into text in the box; hidden where the browser cannot), the same send button.
   Styles are in site.css (.s-box, .s-you, .s-sus).

     var box = sussuriBox.mount(hostElement, { placeholder:'Ask anything…', onSend:function (text) { … } });
     box.field      the <textarea>
     box.off(true)  greys the box out and stops typing (false brings it back)
     box.busy(true) stops sending while a reply is on its way
     sussuriBox.msg(threadElement, 'you' | 'sus', text)   adds a message in the Chat page's style, returns it
   ========================================================================== */
(function () {
  var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  var MIC = '<svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" stroke-width="1.4" stroke-linecap="round"><rect x="9" y="2.5" width="6" height="11.5" rx="3"/><path d="M5.500 11a6.500 6.500 0 0 0 13 0M12 17.500V21.500"/></svg>';
  var SEND = '<svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" stroke-width="1.6"><line x1="12" y1="19" x2="12" y2="6"/><polyline points="6,12 12,5.500 18,12"/></svg>';
  function mount(host, o) {
    o = o || {};
    host.classList.add('s-box');
    host.innerHTML =
      '<textarea rows="1" autocomplete="off" aria-label="' + (o.label || 'Your message') + '"></textarea>' +
      '<div class="s-box-tools"><span class="s-box-rec" hidden>Recording</span>' +
      '<button class="s-box-btn mic" type="button" title="Speak, and your words become text" aria-label="Speak, and your words become text" aria-pressed="false"' + (SR ? '' : ' hidden') + '>' + MIC + '</button>' +
      '<button class="s-box-btn send" type="button" title="Send" aria-label="Send">' + SEND + '</button></div>';
    var field = host.querySelector('textarea'), mic = host.querySelector('.mic'), send = host.querySelector('.send'), recLab = host.querySelector('.s-box-rec');
    field.placeholder = o.placeholder || 'Ask anything…';
    var isOff = false, isBusy = false, rec = null;
    function grow() {
      field.style.height = 'auto';
      var max = parseFloat(getComputedStyle(field).maxHeight) || 180;
      field.style.height = Math.min(field.scrollHeight, max) + 'px';
      field.style.overflowY = field.scrollHeight > max ? 'auto' : 'hidden';
    }
    function stopMic() { if (rec) { try { rec.stop(); } catch (e) {} } }
    function setMic(on) { mic.classList.toggle('live', on); mic.setAttribute('aria-pressed', String(on)); recLab.hidden = !on; }
    function startMic() {
      if (!SR || rec || isOff) return;
      var base = field.value ? field.value.replace(/\s*$/, ' ') : '', done = '';
      rec = new SR(); rec.continuous = true; rec.interimResults = true; rec.lang = navigator.language || 'en-US';
      rec.onresult = function (e) {
        var live = '';
        for (var i = e.resultIndex; i < e.results.length; i++) { var t = e.results[i][0].transcript; if (e.results[i].isFinal) done += t; else live += t; }
        field.value = base + done + live; grow(); field.scrollTop = field.scrollHeight;
      };
      rec.onerror = function (e) { if ((e.error === 'not-allowed' || e.error === 'service-not-allowed') && o.onMicBlocked) o.onMicBlocked(); };
      rec.onend = function () { rec = null; setMic(false); };
      try { rec.start(); setMic(true); } catch (e) { rec = null; }
    }
    function submit() {
      var text = field.value.trim();
      if (!text || isOff || isBusy) return;
      stopMic(); field.value = ''; grow();
      if (o.onSend) o.onSend(text);
    }
    field.addEventListener('input', grow);
    field.addEventListener('keydown', function (e) { if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); submit(); } });   // Shift+Enter = new line
    // on a phone, keep the box above the keyboard when it opens
    field.addEventListener('focus', function () { setTimeout(function () { try { host.scrollIntoView({ block:'nearest' }); } catch (e) {} }, 300); });
    send.addEventListener('click', submit);
    mic.addEventListener('click', function () { rec ? stopMic() : startMic(); });
    function sync() { field.disabled = isOff; mic.disabled = isOff; send.disabled = isOff || isBusy; host.classList.toggle('off', isOff); if (isOff) stopMic(); }
    return {
      el: host, field: field,
      off: function (v) { isOff = !!v; sync(); },
      busy: function (v) { isBusy = !!v; sync(); },
      focus: function () { try { field.focus(); } catch (e) {} },
      set: function (t) { field.value = t || ''; grow(); }
    };
  }
  function msg(thread, who, text) {
    var d = document.createElement('div');
    d.className = who === 'you' ? 's-you' : 's-sus';
    d.textContent = text;
    thread.appendChild(d);
    thread.scrollTop = thread.scrollHeight;
    return d;
  }
  window.sussuriBox = { mount: mount, msg: msg };
})();
