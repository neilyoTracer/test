// File transfer
//--define(['jquery', 'common', 'stringres', 'global'], function($, common, stringres, global)
wpa._filetransfer = (function ()
{

function onCreate (event) // called only once - bind events here
{
    try{
    common.PutToDebugLog(4, "EVENT, _filetransfer: onCreate");
    
    j$( window ).resize(function() // window resize handling
    {
        if (j$.mobile.activePage.attr('id') === 'page_filetransfer')
        {
            MeasureFiletransfer();
        }
    });

    j$('#filetransfer_menu_ul').on('click', 'li', function(event)
    {
        MenuItemSelected(j$(this).attr('id'));
    });
    j$("#btn_filetransfer_menu").on("click", function() { CreateOptionsMenu('#filetransfer_menu_ul'); });
    j$("#btn_filetransfer_menu").attr("title", stringres.get("hint_menu"));
    
    j$("#btn_filetransfpick").on("click", function() { common.PickContact(PickContactResult); });
    j$("#btn_filetransfpick").attr("title", stringres.get('hint_choosect'));
    
    j$("#filetransfer_btnback").attr("title", stringres.get("hint_btnback"));
    
//--    j$("#btn_filetransf").on("click", function(event) { SendFile(event); });
//--    j$("#btn_filetransf").attr("title", stringres.get('hint_filetranf'));
    
    } catch(err) { common.PutToDebugLogException(2, "_filetransfer: onCreate", err); }
}

var iframe = document.createElement('iframe');
var actionurl = '';
function onStart(event)
{
    try{
    common.PutToDebugLog(4, "EVENT, _filetransfer: onStart");
    global.isFiletransferStarted = true;
    
    if (!common.isNull(document.getElementById('filetransfer_title')))
    {
        document.getElementById('filetransfer_title').innerHTML = stringres.get("filetransf_title");
    }
    j$("#filetransfer_title").attr("title", stringres.get("hint_page"));

    if (!common.isNull(document.getElementById('filetransfer_btnback')))
    {
        document.getElementById('filetransfer_btnback').innerHTML = '<b>&LT;</b>&nbsp;' + stringres.get("go_back_btn_txt");
    }
    
    var destination = common.GetIntentParam(global.intentfiletransfer, 'destination');
    if (common.isNull(destination)) { destination = ''; }
    j$('#filetransfpick_input').val(destination);
    
    j$(".separator_line_thick").css( 'background-color', common.HoverCalc(common.getBgColor('#filetransfer_header'), -30) );
    
    j$("#filetransfpick_input").attr("placeholder", stringres.get("filetransfer_nr"));
    // set focus on destination
    setTimeout(function ()
    {
        var tovalTmp = j$("#filetransfpick_input").val();
        if (common.isNull(tovalTmp) || (common.Trim(tovalTmp)).length < 1)
        {
            j$("#filetransfpick_input").focus();
        }
    }, 100);
    
    actionurl = GetFormActionUrl();
    common.PutToDebugLog(2, 'EVENT, filetransfer actionurl: ' + actionurl);
    
// add iframe
    iframe.style.background = 'transparent';
    iframe.style.border = '0';
    iframe.style.width = '100%';
    iframe.style.overflow = 'hidden';
    var html = '<body style="margin 0; padding 0; background: transparent; width: 100%; overflow:hidden; font-size: 1em; color: #cecece;">' +
                    '<style>' +
                        '#fileinput { padding: .6em; background: #ffffff; display: inline-block; width: 95%; border: .1em solid #b8b8b8; -webkit-border-radius: .15em; border-radius: .15em;' +
                                            'cursor: pointer; font-weight: bold; font-size: 1em; }' +

                        '#btn_filetransf { display: inline-block; margin-top: 1.5em; padding: .6em 2em .6em 2em; border: .1em solid #b8b8b8; -webkit-border-radius: .15em; border-radius: .15em;' +
                                            'cursor: pointer; font-weight: bold; font-size: 1em; background: #cccccc; }' +
                        '#btn_filetransf:hover { background: #ffffff; }' +
                    '</style>' +
                    '<form style=" width: 100%; margin: 0; padding: 0;" action="' + actionurl + '" method="post" enctype="multipart/form-data" id="frm_filetransf" name="frm_filetransf" onsubmit="return OnFormSubmit()">' +
                        '<input type="hidden" id="filepath" name="filepath" value="">' +
                        '<input name="filedata" type="file" id="fileinput" /><br />' +
                        '<input type="submit" id="btn_filetransf" value="' + stringres.get('btn_send') + '" title="' + stringres.get('hint_filetranf') + '" />' +
                        '<script>' +
                            'function OnFormSubmit(){' +
                                'var directory = document.getElementById("filepath").value;' +
                                'var filename = document.getElementById("fileinput").value;' +
                                'return parent.filetransfer_public.FileTransferOnSubmit(directory, filename);' +
                            '}' +
                        '</script>' +
                    '</form>' +
                '</body>';
//--    document.body.appendChild(iframe);
    document.getElementById('ftranf_iframe_container').appendChild(iframe);
    iframe.contentWindow.document.open();
    iframe.contentWindow.document.write(html);
    iframe.contentWindow.document.close();
    iframe.onload = function (evt) { FileUploaded(evt); };
    
    var ifrmDoc = iframe.contentDocument || iframe.contentWindow.document;
    
    setTimeout(function ()
    {
    // fallback for IE7, IE8 addEventListener
        if (ifrmDoc.addEventListener)
        {
            ifrmDoc.addEventListener('click', HandleEventFiletransferStart, false);
        }
        else if (ifrmDoc.attachEvent)
        {
            ifrmDoc.attachEvent('click', HandleEventFiletransferStart);
        }
        
        function HandleEventFiletransferStart(event)
        {
            var dest = document.getElementById('filetransfpick_input').value;

            if (common.isNull(dest) || (common.Trim(dest)).length < 1)
            {
                event.preventDefault();
                j$("#filetransfpick_input").focus();
                common.ShowToast(stringres.get('filetransf_err'));
                return;
            }else
            {
                // set userguid (directory name)
                var filepath = common.GetTransferDirectoryName(dest);
                ifrmDoc.getElementById('filepath').value = filepath;
                
                common.PutToDebugLog(4, 'EVENT, filetransfer directory: ' + filepath);
            }
        }
    }, 150);
    
    MeasureFiletransfer();

    } catch(err) { common.PutToDebugLogException(2, "_filetransfer: onStart", err); }
}

// called from iframe -> for onsubmit
var transf_initiated = false;
function FileTransferOnSubmit(directory, filename)
{
    try{
    common.PutToDebugLog(4, 'EVENT, FileTransferOnSubmit called from iframe form');
    common.PutToDebugLog(4, 'EVENT, FileTransferOnSubmit directory: ' + directory + '; filename: ' + filename);
    
//--    FileTransferOnSubmit directory: 0ecf34d0bd5c69f07b6fa8b654d80a74; filename: C:\fakepath\webphonejar_parameters.txt
    
    if (common.isNull(directory)) { directory = ''; } else { directory = '/' + directory; }
    if (common.isNull(filename) || filename.length < 1)
    {
        common.PutToDebugLog(3, 'ERROR, FileTransfer send failed: ivalid filename: ' + filename);
        common.ShowToast(stringres.get('fitransf_failed'));
        return false;
    }
    
    var pos = filename.lastIndexOf('/');
    if (pos >= 0) { filename = filename.substring(pos + 1, filename.length); }
    pos = filename.lastIndexOf('\\');
    if (pos >= 0) { filename = filename.substring(pos + 1, filename.length); }
    
// the path of the uploaded file on the server
    var transferpath = actionurl + 'filestorage' + directory + '/' + NormalizeFilename(filename);
    common.PutToDebugLog(4, 'EVENT, FileTransferOnSubmit filepath: ' + transferpath);
    
    j$('#ftranf_status').html(stringres.get('ftrnasf_status_processing'));
    
//--     go back one step in history, otherwise <Back must be clicked 2 times to close the window
//--   setTimeout(function ()
//--    {
//--        j$.mobile.back();
//--        common.ShowToast(stringres.get('fitransf_succeded'));
//--    }, 1500);
    
// send chat to destination
    var ahref = '<a href="' + transferpath + '" target="_blank" >' + NormalizeFilename(filename) + '</a>';
    var msg = '[DONT_START_CHAT_WINDOW]' + common.GetParameter('sipusername') + ' ' + stringres.get('fitransf_chat') + ': ' + ahref;
    
    var to = common.Trim(document.getElementById('filetransfpick_input').value);
    
    webphone_api.sendchat(to, msg);
    transf_initiated = true;
    
    return true;
    
    } catch(err) { common.PutToDebugLogException(2, "_filetransfer:  FileTransferOnSubmit", err); }
    return false;
}

function FileUploaded(evt) // actually it's called on iframe.onload
{
    try{
    if (transf_initiated === false) { return; }
    transf_initiated = false;
    
    j$('#ftranf_status').html(stringres.get('ftrnasf_status_waiting'));
    
    // go back one step in history, otherwise <Back must be clicked 2 times to close the window
    setTimeout(function ()
    {
        j$.mobile.back();
    }, 500);
    
    } catch(err) { common.PutToDebugLogException(2, "_filetransfer:  FileUploaded", err); }
}

function NormalizeFilename(filename)
{
    try{
    var tmp = filename;
    var chars = filename.split('');
    
    if (common.isNull(chars) || chars.length < 1) { return tmp; }
    
    for (var i = 0; i < chars.length; i++)
    {
        if((chars[i] >= '0' && chars[i] <= '9') ||
            (chars[i] >= 'A' && chars[i] <= 'Z') ||
            (chars[i] >= 'a' && chars[i] <= 'z') ||
            chars[i] === '_' || chars[i] === '.' || chars[i] === '-')
        {
          ; //--ok
        }
        else
        {
          chars[i] = '_';
        }
    }
    
    return chars.join('');
    
    } catch(err) { common.PutToDebugLogException(2, "_filetransfer:  NormalizeFilename", err); }
    return tmp;
}


function MeasureFiletransfer() // resolve window height size change
{
    try{
//--    var pgh = common.GetDeviceHeight() - 1; j$('#page_filetransfer').css('min-height', pgh + 'px'); // must be set when softphone is skin in div
    j$('#page_filetransfer').css('min-height', 'auto'); // must be set when softphone is skin in div

    j$("#page_filetransfer_content").height(common.GetDeviceHeight() - j$("#filetransfer_header").height() - 2);
//--    j$("#log_text").height(common.GetDeviceHeight() - j$("#filetransfer_header").height() - j$("#sendtosupport_container").height() - 5);
//--    j$("#log_text").width(common.GetDeviceWidth());

    } catch(err) { common.PutToDebugLogException(2, "_filetransfer: MeasureFiletransfer", err); }
}

function PickContactResult(number)
{
    try{
    document.getElementById('filetransfpick_input').value = number;
//--    j$("#msg_textarea").focus();
    
    } catch(err) { common.PutToDebugLogException(2, "_filetransfer: PickContactResult", err); }
}

function GetFormActionUrl()
{
    var furl = '';
    try{
    var srv = '';
    var protocol = '';
    var pos = -1;
// if defined in config, then use that for filetransfer
    var filetransferurl = common.GetParameter('filetransferurl');
    if (!common.isNull(filetransferurl) && filetransferurl.length > 2)
    {
        filetransferurl = common.Trim(filetransferurl);
        filetransferurl = filetransferurl.toLowerCase();
        
        if (filetransferurl.indexOf('http:') < 0 && filetransferurl.indexOf('https:') < 0) { filetransferurl = 'http://' + filetransferurl; }
        
        if (common.IsHttps())
        {
            filetransferurl = filetransferurl.replace('http:', 'https:');
        }

        return filetransferurl;
    }
    
// get file transfer url from:
//  1. if webrtcserveraddress is set and is mizu server (/mfstwebsock), then use IP/port
//  2. otherwise get from balance url if containes mvapireq
//  3. otherwise use UK gateway
    var wsrv = common.GetWebrtcSrvAddr();
    var credurl = common.GetParameter('creditrequest');
    var wuk = common.GetWpS('uk');
    if (!common.isNull(wsrv) && wsrv.length > 3 && wsrv.toLowerCase().indexOf('mfstwebsock') > 0)
    {
        srv = wsrv.toLowerCase();
        protocol = 'http://';
        if (srv.indexOf('wss:') >= 0) { protocol = 'https://'; }
        
        srv = common.NormalizeInput(srv, 0);
        pos = srv.indexOf('/');
        if (pos > 0) { srv = srv.substring(0, pos); }
        srv = common.Trim(srv);
        furl = protocol + srv;
        protocol = '';
    }
    else if (!common.isNull(credurl) && credurl.indexOf('mvapireq') > 0)
    {
        srv = credurl.toLowerCase();
        pos = srv.indexOf('://');
        if (pos > 0)
        {
            protocol = srv.substring(0, pos + 3);
            srv = srv.substring(pos + 3);
        }else
        {
            protocol = 'http://';
            if (common.IsHttps() === true) { protocol = 'https://'; }
        }

        pos = srv.indexOf('/');
        if (pos > 0) { srv = srv.substring(0, pos); }
        srv = common.Trim(srv);
        furl = protocol + srv;
        protocol = '';
    }
    else if (!common.isNull(wuk) && wuk.length > 3)
    {
        srv = wuk.toLowerCase();
        protocol = 'http://';
        if (srv.indexOf('wss:') >= 0) { protocol = 'https://'; }
        
        srv = common.NormalizeInput(srv, 0);
        pos = srv.indexOf('/');
        if (pos > 0) { srv = srv.substring(0, pos); }
        srv = common.Trim(srv);
        furl = protocol + srv;
        protocol = '';
    }
    
    if (furl.length < 1)
    {
        common.PutToDebugLog(3, 'ERROR, filetransfer invalid URL');
        return '';
    }

    furl = furl.replace('*', '');
    furl = furl + '/mvweb/';
    return furl;
    
    } catch(err) { common.PutToDebugLogException(2, "_filetransfer: GetFormActionUrl", err); }
    return '';
}

var MENUITEM_FILETRANSFER_CLOSE = '#menuitem_filetransfer_close';

function CreateOptionsMenu (menuId) // adding items to menu, called from html
{
    try{
// remove data transition for windows softphone, because it's slow
    if (common.GetParameter('devicetype') === common.DEVICE_WIN_SOFTPHONE())
    {
        j$( "#btn_filetransfer_menu" ).removeAttr('data-transition');
    }

    if ( common.isNull(menuId) || menuId.lenght < 1 ) { common.PutToDebugLog(2, "ERROR, _filetransfer: CreateOptionsMenu menuid null"); return; }

    if (j$(menuId).length <= 0) { common.PutToDebugLog(2, "ERROR, _filetransfer: CreateOptionsMenu can't get reference to Menu"); return; }
    
    if (menuId.charAt(0) !== '#') { menuId = '#' + menuId; }
    
    j$(menuId).html('');
    j$(menuId).append( '<li id="' + MENUITEM_FILETRANSFER_CLOSE + '"><a data-rel="back">' + stringres.get('menu_close') + '</a></li>' ).listview('refresh');

    return true;
    
    } catch(err) { common.PutToDebugLogException(2, "_filetransfer: CreateOptionsMenu", err); }
    
    return false;
}

function MenuItemSelected(itemid)
{
    try{
    if (common.isNull(itemid) || itemid.length < 1) { return; }
    
    j$( '#filetransfer_menu' ).on( 'popupafterclose', function( event )
    {
        j$( '#filetransfer_menu' ).off( 'popupafterclose' );
        
        switch (itemid)
        {
            case MENUITEM_FILETRANSFER_CLOSE:
                j$.mobile.back();
                break;
        }
    });
    } catch(err) { common.PutToDebugLogException(2, "_filetransfer: MenuItemSelected", err); }
}

function onStop(event)
{
    try{
    common.PutToDebugLog(4, "EVENT, _filetransfer: onStop");
    global.isFiletransferStarted = false;
    
    if (!common.isNull(iframe))
    {
        document.getElementById('ftranf_iframe_container').removeChild(iframe);
    }
    document.getElementById('filetransfpick_input').value = '';
    j$('#ftranf_status').html('');
    
    } catch(err) { common.PutToDebugLogException(2, "_filetransfer: onStop", err); }
}

function onDestroy (event){} // deprecated by onstop

var filetransfer_public = {

    FileTransferOnSubmit: FileTransferOnSubmit
};
window.filetransfer_public = filetransfer_public;

// public members and methods
return {
    onCreate: onCreate,
    onStart: onStart,
    onStop: onStop,
    onDestroy: onDestroy
};
})();