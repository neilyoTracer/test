// Message List page
//--define(['jquery', 'common', 'stringres', 'global'], function($, common, stringres, global)
wpa._message = (function ()
{
var mAction = '';
var msgSent = false;
var textarea = null;
var mTo = '';
var mMessage = '';
var mContent = '';
var sendrec = false; // if at least one message was sent or received in this session
var placeholderhidden = false;
var enablepres = false;
var composePlaceHolder = '<span style="color: #ccc;">' + stringres.get('messagepl') + '</span>';

function onCreate (event) // called only once - bind events here
{
    try{
    common.PutToDebugLog(4, "EVENT, _message: onCreate");
    
    j$( window ).resize(function() // window resize handling
    {
        if (j$.mobile.activePage.attr('id') === 'page_message')
        {
            MeasureMessage();
        }
    });
    
    j$('#message_menu_ul').on('click', 'li', function(event)
    {
        MenuItemSelected(j$(this).attr('id'));
    });
    j$("#btn_message_menu").on("click", function() { CreateOptionsMenu('#message_menu_ul'); });
    j$("#btn_message_menu").attr("title", stringres.get("hint_menu"));
    
var lastiscomposingsenttick = 0;  //milliseconds. reset to 0 at every chat send and chatreport recv
var reportforlastchatmessagereceived= 0;  //0=not needed,1=needed,2=received success,3=received fail  (set state on chat send to 1 and chatreport recv to 2 or 3)
    j$("#msg_textarea").keyup(function()
    {
        
    // character count
        j$("#msg_charcount").text(j$(this).html().length);
        
        //don’t send if previous msg is pending
        if (reportforlastchatmessagereceived === 1)
        {
            return;
        }

        if (lastiscomposingsenttick === 0 || common.GetTickCount() - lastiscomposingsenttick > 10000)  //send in every 10 second on typing
        {
            lastiscomposingsenttick = common.GetTickCount();
            webphone_api.sendchatiscomposing(mTo);
        }
    });
    
    j$( "#msg_textarea" ).keypress(function( event )
    {
    // handle placeholder in div
        if (placeholderhidden === false)
        {
            placeholderhidden = true;
            var mtmp = j$("#msg_textarea").html();
            
            if (!common.isNull(mtmp) && mtmp.length > 0)
            {
                var pos = mtmp.indexOf('</span>');
                if (pos > 0)
                {
                    mtmp = mtmp.substring(pos + 7);
                    j$("#msg_textarea").html(mtmp);
                }
            }
        }

//--        // handle delete in content ediatble in Firefox
//--        if (common.GetBrowser() === 'Firefox')
//--        {
//--            var charCode = (event.keyCode) ? event.keyCode : event.which; // workaround for firefox
//--            if (charCode === 46) // delete
//--            {
//--                var cpos = GetCursorPosition(document.getElementById('msg_textarea'));
//--                var htmlc = j$("#msg_textarea").html();

//--                if (common.isNull(cpos) || cpos < 0 || common.isNull(htmlc) || htmlc.length < cpos) { return; }
//--            alert(htmlc);

//--                var delidx = 0;
//--                var insidetag = false; // don't count characters if we are inside of a html tag
//--                for (var i = 0; i < htmlc.length; i++)
//--                {
//--                    if (delidx === cpos)
//--                    {
//--                        var begin = htmlc.substring(0, i);
//--                        var end = htmlc.substring(i + 1, htmlc.length);
//--                        j$("#msg_textarea").html(begin + end);
//--                        break;
//--                    }
                    
//--                    if (htmlc.charCodeAt(i) === '<') { insidetag = true; }
//--                    if (insidetag === true && htmlc.charCodeAt(i - 1) === '>') { insidetag = false; }
                    
//--                    if (insidetag === false)
//--                    {
//--                        delidx++;
//--                    }
//--                }
//--            }
//--        }

        if (common.GetParameter2('sendchatonenter') !== 'false')
        {
            if ( event.which === 13)
            {
                event.preventDefault();
                j$("#btn_msgsend").click();
            }else
            {
                return;
            }
        }else
        {
            return;
        }
    });
    
    j$("#status_message").attr("title", stringres.get("hint_status"));
    j$("#curr_user_message").attr("title", stringres.get("hint_curr_user"));
    
    j$("#btn_msgsend").on("click", function()
    {
        SendMessage();
        lastiscomposingsenttick = 0;
    });
    
    j$("#msg_btn_sendfile").on("click", function()
    {
        common.FileTransfer(j$("#msgpick_input").val());
    });
    j$("#msg_btn_sendfile").attr("title", stringres.get("hint_filetranf"));
    
    j$("#btn_msgsend").attr("title", stringres.get('hint_sendmsg'));
    7
    j$("#msg_btn_smiley").on("click", function() { OpenSmileys(); });
    j$("#msg_btn_smiley").attr("title", stringres.get('hint_smiley'));
    
    j$("#btn_msgpick").on("click", function() { common.PickContact(PickContactResult); });
    j$("#btn_msgpick").attr("title", stringres.get('hint_choosect'));
    
    j$("#msg_btnback").attr("title", stringres.get("hint_btnback"));
        
    } catch(err) { common.PutToDebugLogException(2, "_message: onCreate", err); }
}

function GetCursorPosition(element)
{
    try{
    var caretOffset = 0;
    var doc = element.ownerDocument || element.document;
    var win = doc.defaultView || doc.parentWindow;
    var sel;
    if (typeof win.getSelection != "undefined") {
        sel = win.getSelection();
        if (sel.rangeCount > 0) {
            var range = win.getSelection().getRangeAt(0);
            var preCaretRange = range.cloneRange();
            preCaretRange.selectNodeContents(element);
            preCaretRange.setEnd(range.endContainer, range.endOffset);
            caretOffset = preCaretRange.toString().length;
        }
    } else if ( (sel = doc.selection) && sel.type != "Control") {
        var textRange = sel.createRange();
        var preCaretTextRange = doc.body.createTextRange();
        preCaretTextRange.moveToElementText(element);
        preCaretTextRange.setEndPoint("EndToEnd", textRange);
        caretOffset = preCaretTextRange.text.length;
    }
    return caretOffset;
    } catch(err) { common.PutToDebugLogException(2, "_message: GetCursorPosition", err); }
    return 0;
}

function onStart(event)
{
    try{
    common.PutToDebugLog(4, "EVENT, _message: onStart");
    global.isMessageStarted = true;
    
//--    j$("#phone_number").attr("placeholder", stringres.get("phone_nr"));
//--    document.getElementById("app_name_message").innerHTML = common.GetBrandName();
    
    j$(".separator_line_thick").css( 'background-color', common.HoverCalc(common.getBgColor('#page_message'), -30) );
    
// add placeholder on page start
    j$( "#msg_textarea" ).html(composePlaceHolder);
    
// needed for proper display and scrolling of listview
    MeasureMessage();
    
    if (common.UsePresence2() === true) { enablepres = true; }
    
    // fix for IE 10
//--    if (common.IsIeVersion(10)) { j$("#messagelist_list").children().css('line-height', 'normal'); }
    
    mAction = common.GetIntentParam(global.intentmsg, 'action');
    mTo = common.GetIntentParam(global.intentmsg, 'to');
    mMessage = common.GetIntentParam(global.intentmsg, 'message');
    
    if (!common.isNull(document.getElementById('msg_title')) && !common.isNull(mAction))
    {
        if (mAction === 'sms')
        {
            document.getElementById('msg_title').innerHTML = stringres.get("msg_title_sms");
        }else
        {
            document.getElementById('msg_title').innerHTML = stringres.get("msg_title_chat");
        }
    }
    j$("#msg_title").attr("title", stringres.get("hint_page"));

    if (!common.isNull(document.getElementById('msg_btnback')))
    {
        document.getElementById('msg_btnback').innerHTML = '<b>&LT;</b>&nbsp;' + stringres.get("go_back_btn_txt");
    }
    
    if (common.isNull(mTo)) { mTo = ''; }
    if (common.isNull(mMessage)) { mMessage = ''; }
    
    j$("#msgpick_input").attr("placeholder", stringres.get("chat_nr"));
    
// set focus on destination or message compose area
    setTimeout(function ()
    {
        var tovalTmp = j$("#msgpick_input").val();
        if (common.isNull(tovalTmp) || (common.Trim(tovalTmp)).length < 1)
        {
            j$("#msgpick_input").focus();
        }else
        {
            j$("#msg_textarea").focus();
        }
    }, 100);
        
    LoadMessage();
    
    } catch(err) { common.PutToDebugLogException(2, "_message: onStart", err); }
}

function MeasureMessage() // resolve window height size change
{
    try{
//--    var pgh = common.GetDeviceHeight() - 1; j$('#page_message').css('min-height', pgh + 'px'); // must be set when softphone is skin in div
    j$('#page_message').css('min-height', 'auto'); // must be set when softphone is skin in div

    var heightTemp = common.GetDeviceHeight() - j$("#message_header").height() /*- j$('#msg_spacer').height()*/ - j$('#msg_textarea_container').height();

    if (document.getElementById('msgpick_container').style.display === 'block')
    {
        heightTemp = heightTemp - j$("#msgpick_container").height();
    }
    
    var curruser = common.GetParameter('sipusername');
    if (!common.isNull(curruser) && curruser.length > 0) { j$('#curr_user_message').html(curruser); }
// set status width so it's uses all space to curr_user
    var statwidth = common.GetDeviceWidth() - j$('#curr_user_message').width() - 25;
    if (!common.isNull(statwidth) && common.IsNumber(statwidth))
    {
        j$('#status_message').width(statwidth);
    }

    heightTemp = Math.floor( heightTemp - 6 );
    j$("#msg_list").height(heightTemp);
    
    } catch(err) { common.PutToDebugLogException(2, "_message: MeasureMessage", err); }
}

function LoadMessage()
{
    try{
    // if file exists, read content and populateit
    if (!common.isNull(mTo) && mTo.length > 0)
    {
        document.getElementById('msgpick_input').value = mTo;
        
        // filenames: sms/chat_username_number
    
        var currfile = mAction + '_' + common.GetParameter('sipusername') + '_' + mTo;
        
        global.File.ReadFile(currfile, global.STORAGE_LOCAL, function (content)
        {
            if ( common.isNull(content) || common.Trim(content).length < 1 )
            {
                common.PutToDebugLog(2, 'ERROR, _message: LoadMessage no content');
                content = '';
                document.getElementById('msgpick_container').style.display = 'block';
                MeasureMessage();
            }
            mContent = content;
            
            if (!common.isNull(mMessage) && mMessage.length > 0)
            {
                AddMessage('1', true);
            }
            
            PopulateData();
        });
        
    }else
    {
        document.getElementById('msgpick_container').style.display = 'block';
        MeasureMessage();
        
        if (!common.isNull(mMessage) && mMessage.length > 0)
        {
            AddMessage('1', true);
        }
        
        PopulateData();
    }
    } catch(err) { common.PutToDebugLogException(2, "_message: LoadMessage", err); }
}

function PopulateData() // :no return value
{
    try{
    if ( common.isNull(document.getElementById('page_message_content')) )
    {
        common.PutToDebugLog(2, "ERROR, _message: PopulateList listelement is null");
        return;
    }
    // filenames: sms/chat_username_number

    j$('#msg_list').append(mContent);
    ScrollToBottom();
    RemoveNotification();
    
// show presence status in title, if we have username/contact
    if (!common.isNull(mTo) && mTo.length > 0 && enablepres === true)
    {
        var presencequery = [];
        var presence = '-1';
        var presobj = global.presenceHM[mTo];
        if (!common.isNull(presobj)) { presence = presobj[common.PRES_STATUS]; }

            // -1=not exists(undefined), 0=offline, 1=invisible, 2=idle, 3=pending, 4=DND, 5=online
        if (common.isNull(presence) || presence.length < 1 || presence === '-1')
        {
            common.PresenceGet2(mTo);
        }else
        {
            DisplayPresence(presence);
        }
    }
    } catch(err) { common.PutToDebugLogException(2, "_message: LoadMessage", err); }
}

function RefreshPresence()
{
    common.PresenceGet2(mTo);
}

var lastpres_stat = '';
function DisplayPresence(presence)
{
    try{
    if (enablepres !== true || common.isNull(presence) || presence.length < 1) { return; }
    lastpres_stat = presence;

    if (!common.isNull(document.getElementById('msg_title')) && !common.isNull(mAction))
    {
        var ptitle = '';
        if (mAction === 'sms') { ptitle = stringres.get("msg_title_sms"); } else { ptitle = stringres.get("msg_title_chat"); }
        
        var presenceimg = ''
        if (common.isNull(presence) || presence.length < 1)
        {
            presenceimg = '';
        }
        else if (presence === '0') // offline
        {
            presenceimg = '<img src="' + common.GetElementSource() + 'images/presence_grey.png" />';
        }
        else if (presence === '1') // invisible
        {
            presenceimg = '<img src="' + common.GetElementSource() + 'images/presence_white.png" />';
        }
        else if (presence === '2') // idle
        {
            presenceimg = '<img src="' + common.GetElementSource() + 'images/presence_yellow.png" />';
        }
        else if (presence === '3') // pending
        {
            presenceimg = '<img src="' + common.GetElementSource() + 'images/presence_orange.png" />';
        }
        else if (presence === '4') // DND
        {
            presenceimg = '<img src="' + common.GetElementSource() + 'images/presence_red.png" />';
        }
        else if (presence === '5') // online
        {
            presenceimg = '<img src="' + common.GetElementSource() + 'images/presence_green.png" />';
        }
        else
        {
            presenceimg = '';
        }
        
        if (!common.isNull(presenceimg) && presenceimg.length > 0 && !common.isNull(mTo) && mTo.length > 0)
        {
            ptitle = ptitle + '&nbsp;&nbsp;&nbsp;' + mTo + ' ' + presenceimg;

            document.getElementById('msg_title').innerHTML = ptitle;
        }
    }
    
    } catch(err) { common.PutToDebugLogException(2, "_message: DisplayPresence", err); }
}

function RemoveNotification() // remove new message notification (number) from filenames list for the opened message thread
{
    try{

    var files = common.GetParameter('messagefiles');
    
    if (common.isNull(files) || files.length < 3)
    {
        common.PutToDebugLog(3, 'EVENT, _message: RemoveNotification no message files');
        return;
    }
    
    var msglist = [];
    
    if (!common.isNull(files) && files.length > 0)
    {
        msglist = files.split(',');
    }

    var currfile = mAction + '_' + common.GetParameter('sipusername') + '_' + mTo + '[#';
        
    for (var i = 0; i < msglist.length; i++)
    {
        if (common.isNull(msglist[i]) || msglist[i].length < 3) { continue; }
        
        if (msglist[i].indexOf(currfile) === 0)
        {
            var pos = msglist[i].indexOf('[#');
            
            msglist[i] = msglist[i].substring(0, pos);
            
        // save list
            files = '';
            for (var j = 0; j < msglist.length; j++)
            {
                files = files + ',' + msglist[j];
            }
            
            if (files.indexOf(',') === 0) { files = files.substring(1); } // cut off first comma ,
            if (files.lastIndexOf(',') === files.length - 1) { files = files.substring(0, files.length - 1); } // cut off last comma ,
            
            common.SaveParameter('messagefiles', files);
            
            break;
        }
    }
    } catch(err) { common.PutToDebugLogException(2, "_message: RemoveNotification", err); }
}

function PickContactResult(number)
{
    try{
    document.getElementById('msgpick_input').value = number;
    j$("#msg_textarea").focus();
    
    } catch(err) { common.PutToDebugLogException(2, "_message: PickContactResult", err); }
}

function AddToGroupChat(dest)
{
    try{
    if (common.isNull(dest) || common.Trim(dest).length < 1)
    {
        common.PutToDebugLog(2, 'ERROR, _message: AddToGroupChat invalid destination: ' + dest);
        return;
    }
    
    var inp = document.getElementById('msgpick_input');
    var currval = inp.value;
    if (common.isNull(currval)) { currval = ''; }
    currval = common.Trim(currval);

    // send special message
    if (sendrec === true)
    {
        if (mAction === 'chat')
        {
            var dstlist = currval.split(',');
            for (var i = 0; i < dstlist.length; i++)
            {
                if (common.isNull(dstlist[i]) || common.Trim(dstlist[i]).length < 1) { continue; }

            // send special message about group chat on first message
                var joined = dest + ' ' + stringres.get('gc_message2');
                webphone_api.sendchat(common.Trim(dstlist[i]), joined, 1);
            }

        // send special message about group chat on first message
            var chatwith = '[' + stringres.get('gc_message') + ': ' + currval + ']';
            webphone_api.sendchat(dest, chatwith, 1);
        }
    }


    if (currval.length > 0) { currval = currval + ','; }
    currval = currval + dest;
    inp.value = currval;
    common.PutToDebugLog(2, 'EVENT, _message: AddToGroupChat: ' + dest);

    } catch(err) { common.PutToDebugLogException(2, "_message: AddToGroupChat", err); }
}

function SendMessage() // validate and send chat/sms
{
    try{
    common.PutToDebugLog(5, 'EVENT, _message: SendMessage onclick');

    if (common.isNull(textarea))
    {
        textarea = document.getElementById('msg_textarea');
        if (common.isNull(textarea))
        {
            common.PutToDebugLog(2, 'ERROR, _message: SendMessage textarea is NULL');
            return;
        }
    }
//--    mMessage = textarea.value;
    mMessage = textarea.innerHTML;
    if (!common.isNull(mMessage)) { mMessage = mMessage.replace(composePlaceHolder, ''); }
    
//--    if (common.isNull(mTo) || mTo.length < 1)
//--    {
        var tofrom = document.getElementById('msgpick_input').value;

        if ( common.isNull(tofrom) || (common.Trim(tofrom)).length < 1 )
        {
            if (mAction === 'sms')
            {
                common.ShowToast(stringres.get('err_msg_5'));
            }else
            {
                common.ShowToast(stringres.get('err_msg_6'));
            }
            return;
        }else
        {
            mTo = tofrom;
        }
//--    }
    
    if ( common.isNull(mMessage) || (common.Trim(mMessage)).length < 1 )
    {
        //textarea.value = '';
        textarea.innerHTML = '';
        return;
    }
    
    mMessage = RemoveEmoticon(mMessage);

    SendAction(mTo, mMessage);
    
//--    textarea.value = '';
    textarea.innerHTML = '';

    if (msgSent)
    {
        AddMessage('1', false);

//--        // show that message is sent after 1500 ms (FAKE)
//--        setTimeout(function ()
//--        {
//--            common.ShowToast(stringres.get('message_sent'));
            
//--            // request focus after toast closes
//--            setTimeout(function ()
//--            {
//--                textarea.focus();
//--            }, 3500);
//--        }, 1500);
    }else
    {
        AddMessage('0', false);
    }

    textarea.focus();

    } catch(err) { common.PutToDebugLogException(2, "_message: SendMessage", err); }
}

function SendAction(to, msg) // actually send the message
{
    try{
    if (mAction === 'sms')
    {
        common.PutToDebugLog(5,"EVENT, _message SendMessage to: " + mTo + '; message: ' + mMessage);

        var toLocal = common.Trim(mTo);
        var msgLocal = common.Trim(mMessage);
        
    // handle groupchat
        if (mTo.indexOf(',') > 0)
        {
            var dstlist = mTo.split(',');
            for (var i = 0; i < dstlist.length; i++)
            {
                if (common.isNull(dstlist[i]) || common.Trim(dstlist[i]).length < 1) { continue; }
                
                // send special message about group chat on first message
                if (sendrec === false)
                {
                    var chatwith = dstlist.toString();
                    chatwith = chatwith.replace(',' + dstlist[i], '');
                    chatwith = chatwith.replace(dstlist[i] + ',', '');
                    chatwith = chatwith.replace(dstlist[i], '');
                    chatwith = '[' + stringres.get('gc_message') + ': ' + chatwith + ']';
                    
                    common.UriParser(common.GetParameter('sms'), '', common.GetParameter('sipusername'), common.Trim(dstlist[i]), chatwith, 'sendsms');
                }
                
                common.UriParser(common.GetParameter('sms'), '', common.GetParameter('sipusername'), common.Trim(dstlist[i]), msgLocal, 'sendsms');
            }
        }else
        {
            common.UriParser(common.GetParameter('sms'), '', common.GetParameter('sipusername'), toLocal, msgLocal, 'sendsms');
        }

        msgSent = true;
    }else
    {
        if (mTo.indexOf(',') > 0 && sendrec === false)
        {
            var dstlist = mTo.split(',');
            for (var i = 0; i < dstlist.length; i++)
            {
                if (common.isNull(dstlist[i]) || common.Trim(dstlist[i]).length < 1) { continue; }
                
            // send special message about group chat on first message
                var chatwith = dstlist.toString();
                chatwith = chatwith.replace(',' + dstlist[i], '');
                chatwith = chatwith.replace(dstlist[i] + ',', '');
                chatwith = chatwith.replace(dstlist[i], '');
                chatwith = '[' + stringres.get('gc_message') + ': ' + chatwith + ']';

                webphone_api.sendchat(common.Trim(dstlist[i]), chatwith, 1);
            }
        }
        
        webphone_api.sendchat(mTo, mMessage, 1);
        msgSent = true;
    }
    
    sendrec = true;
    } catch(err) { common.PutToDebugLogException(2, "_message: SendAction", err); }
}

var month = new Array();
month[0] = 'Jan';
month[1] = 'Feb';
month[2] = 'Mar';
month[3] = 'Apr';
month[4] = 'May';
month[5] = 'Jun';
month[6] = 'Jul';
month[7] = 'Aug';
month[8] = 'Sep';
month[9] = 'Oct';
month[10] = 'Nov';
month[11] = 'Dec';

function GetDateForMessage()
{
    try{
    var date = new Date();

    var minutes = date.getMinutes();
    if (minutes < 10) { minutes = '0' + minutes; }

    var day = date.getDate(); //-- getDay returns the day of the week
    if (day < 10) { day = '0' + day; }

    var datestr = month[date.getMonth()] + ', ' + day + ' ' + date.getFullYear()+ ' '
            + date.getHours() + ':' + minutes;
    
    return datestr;

    } catch(err) { common.PutToDebugLogException(2, "_message: GetDateForMessage", err); }
    return '';
}

var lastmsg = '';
var lasttickmsg = 0;
var climit = -1;
// add message to UI and save it in List<String>
function AddMessage(sentStatus, isincoming)
{
    var lastoop = 0;
    try{

    if (common.isNull(mMessage))
    {
        common.PutToDebugLog(3, "ERROR, _message: AddMessage message is empty (null)");
        return;
    }
    
// filter duplicate chat messages: filterchatduplicates
    if (climit < 0)
    {
        if (common.GetParameter2('filterchatduplicates') === 'true')
        {
            climit = 10000; // 10 sec
        }else
        {
            climit = 1000;
        }
    }
    lastoop = 1;
    var NOW = common.GetTickCount();
    if (mMessage.length > 0 && mMessage === lastmsg && NOW - lasttickmsg < climit) { return; }
    lastmsg = mMessage;
    lasttickmsg = NOW;

    var ctname = '';
    if (isincoming)
    {
        ctname = common.GetContactNameFromNumber(mTo);
    }else
    {
        ctname = stringres.get('me');
    }
    
    var formattedmsg = '';
// if received chat message is filetransfer, then create a link from url
    if (mMessage.indexOf('/filestorage/') > 0)
    {
        
        
        // try to get url
        var furl = mMessage;
        var filename = '';
        pos = furl.indexOf('http:');
        if (pos < 0) { pos = furl.indexOf('https:'); }
        if (pos >= 0)
        {
            furl = common.Trim(furl.substring(pos, furl.length));
            pos = furl.lastIndexOf('</'); // remove html element closing like </span></p>
            if (pos > 0) { furl = common.Trim(furl.substring(0, pos)); }
            
        // try to get filename
            filename = furl;
            pos = filename.lastIndexOf('/');
            if (pos > 0) { filename = filename.substring(pos + 1, filename.length); }
            filename = common.Trim(filename);   
        }
        
        if (!common.isNull(filename) && filename.length > 0 && !common.isNull(furl) && furl.length > 10)
        {
            pos = mMessage.indexOf('http:');
            if (pos < 0) { pos = mMessage.indexOf('https:'); }
            var start_of_msg = common.Trim(mMessage.substring(0, pos));
            
            formattedmsg = start_of_msg + ' <a href="' + furl + '" target="_blank" onclick="try{webphone_api.filetransfercallback(\'' + mTo + '\')}catch(e){;}">' + filename + '</a>';
        }else
        {
            formattedmsg = mMessage;
        }
    }
    
    if (common.isNull(formattedmsg) || formattedmsg.length < 1) { formattedmsg = mMessage; }
    formattedmsg = AddEmoticon(formattedmsg);
    
    var item = '<b>' + ctname + ':</b><p>' + formattedmsg + '</p><p class="date">' + GetDateForMessage() + '</p>';
    
    j$('#msg_list').append(item);
    ScrollToBottom();

    // filenames: sms/chat_username_number[#nrofmissedmessage
    
    if (common.isNull(mTo) || mTo.length < 1)
    {
        common.PutToDebugLog(2, 'ERROR, _message: AddMessage destination number is NULL');
        return;
    }
    
    var currfile = mAction + '_' + common.GetParameter('sipusername') + '_' + mTo;
    
    var files = common.GetParameter('messagefiles');
    var msglist = [];

    if (!common.isNull(files) && files.length > 0) { msglist = files.split(','); }

    var filenameAdded = false;

    //check if filename exists is msglist and make it the first element (last used - first in msg listview)
    for (var i = 0; i < msglist.length; i++)
    {
        if (common.isNull(msglist[i])) { continue; }

// cut off number of missed messages from file names
        var tempmsgfile = msglist[i];
        var pos = tempmsgfile.indexOf('[#');
        if (pos > 0)
        {
            tempmsgfile = tempmsgfile.substring(0, pos);
        }
        
        if (tempmsgfile === currfile)
        {
            msglist.splice(i, 1);
            msglist.unshift(currfile);
            
            // save list
            files = '';
            for (var j = 0; j < msglist.length; j++)
            {
                files = files + ',' + msglist[j];
            }

            if (files.indexOf(',') === 0) { files = files.substring(1); } // cut off first comma ,
            if (files.lastIndexOf(',') === files.length - 1) { files = files.substring(0, files.length - 1); } // cut off last comma ,

            common.SaveParameter('messagefiles', files);
            filenameAdded = true;
            
            break;
        }
    }
    
    if (!filenameAdded)
    {
        if (files.length > 0)
        {
            files = currfile + ',' + files;
            
            if (files.indexOf(',') === 0) { files = files.substring(1); } // cut off first comma ,
            if (files.lastIndexOf(',') === files.length - 1) { files = files.substring(0, files.length - 1); } // cut off last comma ,
        }else
        {
            files = currfile;
        }
        common.SaveParameter('messagefiles', files);
    }
    
    if (mContent.length < 1) // first try to read file, then save it
    {
        if (common.IsWindowsSoftphone())
        {
            common.ApiWinLoadFile(currfile, function (content)
            {
                if ( !common.isNull(content) || common.Trim(content).length > 0 )
                {
                    mContent = content;
                }

                mContent = mContent + item;

                common.ApiWinSaveFile(currfile, mContent, function (success)
                {
                    if (success)
                    {
                        common.PutToDebugLog(2, 'ERROR, _message: AddMessage cannot save message file (1) WinApi');
                    }
                });
            });
        }else
        {
            global.File.ReadFile(currfile, global.STORAGE_LOCAL, function (content)
            {
                if ( !common.isNull(content) || common.Trim(content).length > 0 )
                {
                    mContent = content;
                }

                mContent = mContent + item;

                global.File.SaveFile(currfile, mContent, global.STORAGE_LOCAL, function (success)
                {
                    if (!success)
                    {
                        common.PutToDebugLog(2, 'ERROR, _message: AddMessage cannot save message file (1)');
                    }
                });
            });
        }
    }else // just save in a new file
    {
        mContent = mContent + item;

        if (common.IsWindowsSoftphone())
        {
            common.ApiWinSaveFile(currfile, mContent, function (success)
            {
                if (!success)
                {
                    common.PutToDebugLog(2, 'ERROR, _message: AddMessage cannot save message file (2) WinApi');
                }
            });
        }else
        {
            global.File.SaveFile(currfile, mContent, global.STORAGE_LOCAL, function (success)
            {
                if (!success)
                {
                    common.PutToDebugLog(2, 'ERROR, _message: AddMessage cannot save message file (2)');
                }
            });
        }
    }

    } catch(err) { common.PutToDebugLogException(2, '_message: AddMessage (' + lastoop.toString() + ')', err); }
}

function SaveMissedIncomingMessage(action, from, name, msg)
{
    try{
    var item = '<b>' + name + ':</b><p>' + msg + '</p><p class="date">' + GetDateForMessage() + '</p>';
    
    // filenames: sms/chat_username_number[#nrofmissedmessage
    
    if (common.isNull(from) || from.length < 1)
    {
        common.PutToDebugLog(2, 'ERROR, _message: SaveMissedIncomingMessage source number is NULL');
        return;
    }
    
    var currfile = action + '_' + common.GetParameter('sipusername') + '_' + from;
    
    var files = common.GetParameter('messagefiles');
    var msglist = [];
    
    if (!common.isNull(files) && files.length > 0) { msglist = files.split(','); }

    var filenameAdded = false;
    var nrmissed = 0; // number of missed messages

    //check if filename exists is msglist and make it the first element (last used - first in msg listview)
    for (var i = 0; i < msglist.length; i++)
    {
        if (common.isNull(msglist[i])) { continue; }

// cut off number of missed messages from file names
        var tempmsgfile = msglist[i];
        var pos = tempmsgfile.indexOf('[#');
        if (pos > 0)
        {
            tempmsgfile = tempmsgfile.substring(0, pos);
        }
        
        if (tempmsgfile === currfile)
        {
            if (pos > 0)
            {
                var temp = common.Trim( msglist[i].substring(pos + 2) );
                
                if (temp.length > 0)
                {
                    try{ nrmissed = common.StrToInt(temp); } catch(err) {   }
                }
            }
            nrmissed = nrmissed + 1;
            
            msglist.splice(i, 1);
            msglist.unshift(currfile + '[#' + nrmissed);
            
            // save list
            files = '';
            for (var j = 0; j < msglist.length; j++)
            {
                files = files + ',' + msglist[j];
            }
            
            if (files.indexOf(',') === 0) { files = files.substring(1); } // cut off first comma ,
            if (files.lastIndexOf(',') === files.length - 1) { files = files.substring(0, files.length - 1); } // cut off last comma ,
            
            common.SaveParameter('messagefiles', files);
            filenameAdded = true;
            
            break;
        }
    }
    
    if (!filenameAdded)
    {
        if (files.length > 0)
        {
            files = currfile + '[#1' + ',' + files;
        }else
        {
            files = currfile + '[#1';
        }
        common.SaveParameter('messagefiles', files);
    }
    
// first read file, then save it
    if (common.IsWindowsSoftphone())
    {
        common.ApiWinLoadFile(currfile, function (content)
        {
            if ( common.isNull(content) ) { content = ''; }

            content = content + item;

            common.ApiWinSaveFile(currfile, content, function (success)
            {
                if (!success)
                {
                    common.PutToDebugLog(2, 'ERROR, _message: SaveMissedIncomingMessage cannot save message file (1) WinApi');
                }
            });
        });
    }else
    {
        global.File.ReadFile(currfile, global.STORAGE_LOCAL, function (content)
        {
            if ( common.isNull(content) ) { content = ''; }

            content = content + item;

            global.File.SaveFile(currfile, content, global.STORAGE_LOCAL, function (success)
            {
                if (!success)
                {
                    common.PutToDebugLog(2, 'ERROR, _message: SaveMissedIncomingMessage cannot save message file (1)');
                }
            });
        });
    }

    } catch(err) { common.PutToDebugLogException(2, '_message: SaveMissedIncomingMessage', err); }
}

function ShowIncomingMessage(action, from, msg)
{
    try{
// if received message, then set status to online if it was offline
    if (enablepres === true)
    {
        global.msg_presence_timer = 0;
        
        if (!common.isNull(lastpres_stat) && lastpres_stat !== '0')
        {
            DisplayPresence('5'); // set to online
        }
    }
    
    sendrec = true;
//--    if (from === mTo)
    if (mTo.indexOf(from) >= 0)
    {
        msg = common.ReplaceAll(msg, "\\<.*?>", "");
        mMessage = msg;
        AddMessage("1", true);
        
        if (mTo.indexOf(',') > 0)
        {
            var dstlist = mTo.split(',');
            for (var i = 0; i < dstlist.length; i++)
            {
                if (common.isNull(dstlist[i]) || common.Trim(dstlist[i]).length < 1) { continue; }
                if (dstlist[i] === from) { continue; }
                
                if (mAction === 'sms')
                {
                    common.UriParser(common.GetParameter('sms'), '', common.GetParameter('sipusername'), common.Trim(dstlist[i]), msg, 'sendsms');
                }else
                {
                    webphone_api.sendchat(common.Trim(dstlist[i]), msg, 1);
                }
            }
        }
    }else
    {
        var name = common.GetContactNameFromNumber(from);
        common.PutNotifications2('1', '', name + ' - ' + from, 0);
        SaveMissedIncomingMessage(action, from, name, msg);
    }
    } catch(err) { common.PutToDebugLogException(2, '_message: ShowIncomingMessage', err); }
}

function ScrollToBottom()
{
    try{
    var d = j$('#msg_list');
    d.scrollTop(d.prop("scrollHeight"));
    
    } catch(err) { common.PutToDebugLogException(2, "_message: ScrollToBottom", err); }
}

var MENUITEM_MESSAGE_DELETE = '#menuitem_message_delete';
var MENUITEM_MESSAGE_FILETRANSFER = '#menuitem_message_filetransfer';
var MENUITEM_MESSAGE_CALL = '#menuitem_message_call';
var MENUITEM_MESSAGE_GROUPCHAT = '#menuitem_message_groupchat';

function CreateOptionsMenu (menuId) // adding items to menu, called from html
{
    try{
// remove data transition for windows softphone, because it's slow
    if (common.IsWindowsSoftphone())
    {
        j$( "#btn_message_menu" ).removeAttr('data-transition');
    }

    if ( common.isNull(menuId) || menuId.lenght < 1 ) { common.PutToDebugLog(2, "ERROR, _message: CreateOptionsMenu menuid null"); return; }

    if (j$(menuId).length <= 0) { common.PutToDebugLog(2, "ERROR, _message: CreateOptionsMenu can't get reference to Menu"); return; }
    
    if (menuId.charAt(0) !== '#') { menuId = '#' + menuId; }
    
    j$(menuId).html('');
    j$(menuId).append( '<li id="' + MENUITEM_MESSAGE_DELETE + '"><a data-rel="back">' + stringres.get('delete_text') + '</a></li>' ).listview('refresh');
    
    j$(menuId).append( '<li id="' + MENUITEM_MESSAGE_CALL + '"><a data-rel="back">' + stringres.get('menu_call') + '</a></li>' ).listview('refresh');
    
    if (common.GetConfigBool('hasfiletransfer', true) !== false && (common.GetConfigBool('usingmizuserver', false) === true || common.IsMizuWebRTCGateway() === true))
    {
        j$(menuId).append( '<li id="' + MENUITEM_MESSAGE_FILETRANSFER + '"><a data-rel="back">' + stringres.get('filetransf_title') + '</a></li>' ).listview('refresh');
    }
    
    j$(menuId).append( '<li id="' + MENUITEM_MESSAGE_GROUPCHAT + '"><a data-rel="back">' + stringres.get('menu_groupchat') + '</a></li>' ).listview('refresh');
    
    return true;
    
    } catch(err) { common.PutToDebugLogException(2, "_message: CreateOptionsMenu", err); }
    
    return false;
}

function MenuItemSelected(itemid)
{
    try{
    if (common.isNull(itemid) || itemid.length < 1) { return; }
    
    j$( '#message_menu' ).on( 'popupafterclose', function( event )
    {
        j$( '#message_menu' ).off( 'popupafterclose' );
        
        switch (itemid)
        {
            case MENUITEM_MESSAGE_DELETE:
                ClearHistory();
                break;
            case MENUITEM_MESSAGE_FILETRANSFER:
                common.FileTransfer(j$("#msgpick_input").val());
                break;
            case MENUITEM_MESSAGE_CALL:
                StartCall(j$("#msgpick_input").val());
                break;
            case MENUITEM_MESSAGE_GROUPCHAT:
                common.PickContact(AddToGroupChat);
                break;
        }
    });
    } catch(err) { common.PutToDebugLogException(2, "_message: MenuItemSelected", err); }
}

function StartCall(number, isvideo)
{
    try{
    if (common.isNull(number) || number.length < 1)
    {
        common.ShowToast(stringres.get('err_msg_4'));
        common.PutToDebugLog(2, "ERROR, _message: StartCall number is NULL");
        return;
    }
    
    number = common.NormalizeNumber(number);
    
    if (isvideo === true)
    {
        common.PutToDebugLog(4, 'EVENT, _message initiate video call to: ' + number);
        webphone_api.videocall(number);
    }else
    {
        common.PutToDebugLog(4, 'EVENT, _message initiate call to: ' + number);
        webphone_api.call(number, -1);
    }
    } catch(err) { common.PutToDebugLogException(2, "_message: StartCall", err); }
}

function ClearHistory(popupafterclose)
{
    try{
    var files = common.GetParameter('messagefiles');
    
    if (common.isNull(files) || files.length < 3 || common.isNull(mTo) || mTo.length < 1)
    {
        common.ShowToast(stringres.get('err_msg_7'));
        return;
    }
    
    var popupWidth = common.GetDeviceWidth();
    if ( !common.isNull(popupWidth) && common.IsNumber(popupWidth) && popupWidth > 100 )
    {
        popupWidth = Math.floor(popupWidth / 1.2);
    }else
    {
        popupWidth = 220;
    }
    
    var template = '' +
'<div data-role="popup" class="ui-content messagePopup" data-overlay-theme="a" data-theme="a" style="max-width:' + popupWidth + 'px;">' +

    '<div data-role="header" data-theme="b">' +
        '<a href="javascript:;" data-role="button" data-icon="delete" data-iconpos="notext" class="ui-btn-right closePopup">Close</a>' +
        '<h1 class="adialog_title">' + stringres.get('delete_text') + '</h1>' +
    '</div>' +
    '<div role="main" class="ui-content adialog_content adialog_alert">' +
        '<span> ' + stringres.get('delete_msg_alert') + ' </span>' +
//        '<a href="javascript:;" class="ui-btn ui-corner-all ui-shadow ui-btn-inline ui-btn-b" data-rel="back">' + stringres.get('btn_close') + '</a>' +
//        '<a href="javascript:;" class="ui-btn ui-corner-all ui-shadow ui-btn-inline ui-btn-b" data-rel="back" data-transition="flow">Delete</a>' +
    '</div>' +
    '<div data-role="footer" data-theme="b" class="adialog_footer">' +
        '<a href="javascript:;" id="btn_adialog_ok" class="ui-btn ui-corner-all ui-shadow ui-btn-inline ui-btn-b adialog_2button" data-rel="back" data-transition="flow">' + stringres.get('btn_ok') + '</a>' +
        '<a href="javascript:;" id="adialog_negative" class="ui-btn ui-corner-all ui-shadow ui-btn-inline ui-btn-b adialog_2button" data-rel="back">' + stringres.get('btn_cancel') + '</a>' +
    '</div>' +
'</div>';
 
    popupafterclose = popupafterclose ? popupafterclose : function () {};

    j$.mobile.activePage.append(template).trigger("create");
//--    j$.mobile.activePage.append(template).trigger("pagecreate");

    j$.mobile.activePage.find(".closePopup").bind("tap", function (e)
    {
        j$.mobile.activePage.find(".messagePopup").popup("close");
    });
    
    j$.mobile.activePage.find(".messagePopup").bind(
    {
        popupbeforeposition: function()
        {
            j$(this).unbind("popupbeforeposition");//.remove();
            var maxHeight =  Math.floor( common.GetDeviceHeight() * 0.6 );  // j$(window).height() - 120;
            
            if (j$(this).height() > maxHeight)
            {
                j$('.messagePopup .ui-content').height(maxHeight);
            }
        }
    });
    
    j$.mobile.activePage.find(".messagePopup").popup().popup("open").bind(
    {
        popupafterclose: function ()
        {
            j$(this).unbind("popupafterclose").remove();
            j$('#btn_adialog_ok').off('click');
            popupafterclose();
        }
    });
    
    j$('#btn_adialog_ok').on('click', function ()
    {
        j$.mobile.activePage.find(".messagePopup").on( 'popupafterclose', function( event )
        {
            j$(this).off( 'popupafterclose' );
        
            var currfile = mAction + '_' + common.GetParameter('sipusername') + '_' + mTo;
            var msglist = files.split(',');

            for (var i = 0; i < msglist.length; i++)
            {
                if (common.isNull(msglist[i])) { continue; }

// cut off number of missed messages from file names
                var tempmsgfile = msglist[i];
                var pos = tempmsgfile.indexOf('[#');
                if (pos > 0)
                {
                    tempmsgfile = tempmsgfile.substring(0, pos);
                }

                if (tempmsgfile === currfile)
                {
                    msglist.splice(i, 1);

                    files = '';
                    for (var j = 0; j < msglist.length; j++)
                    {
                        files = files + ',' + msglist[j];
                    }
                    
                    if (files.indexOf(',') === 0) { files = files.substring(1); } // cut off first comma ,
                    if (files.lastIndexOf(',') === files.length - 1) { files = files.substring(0, files.length - 1); } // cut off last comma ,
                    
                    common.SaveParameter('messagefiles', files);

                    break;
                }
            }

            global.File.DeleteFile(currfile, function (success)
            {
                common.PutToDebugLog(3, 'EVENT, _message: ClearHistory DeleteFile: ' + currfile + ' status: ' + success.toString());
            });

            j$.mobile.back();
        });
    });
    } catch(err) { common.PutToDebugLogException(2, "_message: ClearHistory", err); }
}

function OpenSmileys()
{
    try{
    var scont = document.getElementById('smiley_container');
    if (common.isNull(scont))
    {
        common.PutToDebugLog(2, 'ERROR, _message OpenSmileys: container is NULL');
        return;
    }
    
    scont.style.display = 'block';
    
    var SmileyClose = function ()
    {
        scont.style.display = 'none';
        
        j$("#btn_emoti_smiling").off('click').off('mouseover').off('mouseout');
        j$("#btn_emoti_sad").off('click').off('mouseover').off('mouseout');
        j$("#btn_emoti_laughing").off('click').off('mouseover').off('mouseout');
        j$("#btn_emoti_winking").off('click').off('mouseover').off('mouseout');
        j$("#btn_emoti_surprised").off('click').off('mouseover').off('mouseout');
        j$("#btn_emoti_straightface").off('click').off('mouseover').off('mouseout');
        j$("#btn_emoti_worried").off('click').off('mouseover').off('mouseout');
        j$("#btn_emoti_crying").off('click').off('mouseover').off('mouseout');
        j$("#btn_emoti_cool").off('click').off('mouseover').off('mouseout');
        j$("#btn_emoti_angel").off('click').off('mouseover').off('mouseout');
        j$("#btn_emoti_kiss").off('click').off('mouseover').off('mouseout');
        j$("#btn_emoti_idea").off('click').off('mouseover').off('mouseout');
        j$("#btn_emoti_thinking").off('click').off('mouseover').off('mouseout');
    };
    
    j$("#msg_btn_smiley_close").on("click", function() { SmileyClose(); });
    j$("#msg_btn_smiley_close").attr("title", stringres.get("btn_close"));
    
    var shint = document.getElementById('smiley_hint');
    if (!common.isNull(shint))
    {
        j$("#btn_emoti_smiling").on("mouseover", function() { shint.innerHTML = 'Smiling :)'; }).on("mouseout", function() { shint.innerHTML = ''; });
        j$("#btn_emoti_sad").on("mouseover", function() { shint.innerHTML = 'Sad :('; });  j$("#btn_emoti_sad").on("mouseout", function() { shint.innerHTML = ''; });
        j$("#btn_emoti_laughing").on("mouseover", function() { shint.innerHTML = 'Laughing :))'; });  j$("#btn_emoti_laughing").on("mouseout", function() { shint.innerHTML = ''; });
        j$("#btn_emoti_winking").on("mouseover", function() { shint.innerHTML = 'Winking ;)'; });  j$("#btn_emoti_winking").on("mouseout", function() { shint.innerHTML = ''; });
        j$("#btn_emoti_surprised").on("mouseover", function() { shint.innerHTML = 'Surprised :-O'; });  j$("#btn_emoti_surprised").on("mouseout", function() { shint.innerHTML = ''; });
        j$("#btn_emoti_straightface").on("mouseover", function() { shint.innerHTML = 'StraightFace :|'; });  j$("#btn_emoti_straightface").on("mouseout", function() { shint.innerHTML = ''; });
        j$("#btn_emoti_worried").on("mouseover", function() { shint.innerHTML = 'Worried :-S'; });  j$("#btn_emoti_worried").on("mouseout", function() { shint.innerHTML = ''; });
        j$("#btn_emoti_crying").on("mouseover", function() { shint.innerHTML = 'Crying :(('; });  j$("#btn_emoti_crying").on("mouseout", function() { shint.innerHTML = ''; });
        j$("#btn_emoti_cool").on("mouseover", function() { shint.innerHTML = 'Cool B-)'; });  j$("#btn_emoti_cool").on("mouseout", function() { shint.innerHTML = ''; });
        j$("#btn_emoti_angel").on("mouseover", function() { shint.innerHTML = 'Angel :-O)'; });  j$("#btn_emoti_angel").on("mouseout", function() { shint.innerHTML = ''; });
        j$("#btn_emoti_kiss").on("mouseover", function() { shint.innerHTML = 'Kiss :x'; });  j$("#btn_emoti_kiss").on("mouseout", function() { shint.innerHTML = ''; });
        j$("#btn_emoti_idea").on("mouseover", function() { shint.innerHTML = 'Idea :-I'; });  j$("#btn_emoti_idea").on("mouseout", function() { shint.innerHTML = ''; });
        j$("#btn_emoti_thinking").on("mouseover", function() { shint.innerHTML = 'Thinking :-?'; });  j$("#btn_emoti_thinking").on("mouseout", function() { shint.innerHTML = ''; });
    }
    
    var AddSmiley = function (em)
    {
        try{
        SmileyClose();
//--        var alternate = '';
//--        switch (em)
//--        {
//--            case 'Smiling':alternate = ':)';
//--            case 'Sad':alternate = ':(';
//--            case 'Laughing':alternate = ':))';
//--            case 'Winking':alternate = ';)';
//--            case 'Surprised':alternate = ':-O';
//--            case 'StraightFace':alternate = ':|';
//--            case 'Worried':alternate = ':-S';
//--            case 'Crying':alternate = ':((';
//--            case 'Cool':alternate = 'B-)';
//--            case 'Angel':alternate = ':-O)';
//--            case 'Kiss':alternate = ':x';
//--            case 'Idea':alternate = ':-I';
//--            case 'Thinking':alternate = ':-?';
//--        }
//--        var img = '<img src="images/smiley/' + em + '.gif"alt="' + alternate + '"/>';
        var img = '<img src="' + common.GetElementSource() + 'images/smiley/' + em + '.gif">';
        
        var txta = document.getElementById('msg_textarea');
//--        txta.value = txta.value + ' ' + img + ' ';
        txta.innerHTML = txta.innerHTML + ' ' + img + ' ';
        
        } catch(err) { common.PutToDebugLogException(2, "_message: AddSmiley", err); }
    };
    
    j$("#btn_emoti_smiling").on("click", function() { AddSmiley('Smiling'); });
    j$("#btn_emoti_sad").on("click", function() { AddSmiley('Sad'); });
    j$("#btn_emoti_laughing").on("click", function() { AddSmiley('Laughing'); });
    j$("#btn_emoti_winking").on("click", function() { AddSmiley('Winking'); });
    j$("#btn_emoti_surprised").on("click", function() { AddSmiley('Surprised'); });
    j$("#btn_emoti_straightface").on("click", function() { AddSmiley('StraightFace'); });
    j$("#btn_emoti_worried").on("click", function() { AddSmiley('Worried'); });
    j$("#btn_emoti_crying").on("click", function() { AddSmiley('Crying'); });
    j$("#btn_emoti_cool").on("click", function() { AddSmiley('Cool'); });
    j$("#btn_emoti_angel").on("click", function() { AddSmiley('Angel'); });
    j$("#btn_emoti_kiss").on("click", function() { AddSmiley('Kiss'); });
    j$("#btn_emoti_idea").on("click", function() { AddSmiley('Idea'); });
    j$("#btn_emoti_thinking").on("click", function() { AddSmiley('Thinking'); });
    
    } catch(err) { common.PutToDebugLogException(2, "_message: OpenSmileys", err); }
}

function AddEmoticon(txtin) // convert emoticon text to image:  :) =>  image
{
    try{
    if (common.isNull(txtin) || txtin.length < 1) { return txtin; }
    var txt = txtin;
    
    txt = common.ReplaceAll(txt, ':))', '<img src="' + common.GetElementSource() + 'images/smiley/Laughing.gif">');
    txt = common.ReplaceAll(txt, ':((', '<img src="' + common.GetElementSource() + 'images/smiley/Crying.gif">');
    txt = common.ReplaceAll(txt, ':)', '<img src="' + common.GetElementSource() + 'images/smiley/Smiling.gif">');
    txt = common.ReplaceAll(txt, ':(', '<img src="' + common.GetElementSource() + 'images/smiley/Sad.gif">');
    txt = common.ReplaceAll(txt, ';)', '<img src="' + common.GetElementSource() + 'images/smiley/Winking.gif">');
    txt = common.ReplaceAll(txt, ':-O', '<img src="' + common.GetElementSource() + 'images/smiley/Surprised.gif">');
    txt = common.ReplaceAll(txt, ':|', '<img src="' + common.GetElementSource() + 'images/smiley/StraightFace.gif">');
    txt = common.ReplaceAll(txt, ':-S', '<img src="' + common.GetElementSource() + 'images/smiley/Worried.gif">');
    txt = common.ReplaceAll(txt, 'B-)', '<img src="' + common.GetElementSource() + 'images/smiley/Cool.gif">');
    txt = common.ReplaceAll(txt, ':-O)', '<img src="' + common.GetElementSource() + 'images/smiley/Angel.gif">');
    txt = common.ReplaceAll(txt, ':x', '<img src="' + common.GetElementSource() + 'images/smiley/Kiss.gif">');
    txt = common.ReplaceAll(txt, ':-I', '<img src="' + common.GetElementSource() + 'images/smiley/Idea.gif">');
    txt = common.ReplaceAll(txt, ':-?', '<img src="' + common.GetElementSource() + 'images/smiley/Thinking.gif">');
    
    return txt;
    } catch(err) { common.PutToDebugLogException(2, "_message: AddEmoticon", err); }
    return txtin;
}

function RemoveEmoticon(txtin) // convert emoticon image to text:  image  => :)
{
    try{
    if (common.isNull(txtin) || txtin.length < 1 || txtin.indexOf('<img') < 0) { return txtin; }
    var txt = '';
    var tarr = txtin.split('<img');
    
    var pos = 0;
    for (var i = 0; i < tarr.length; i++)
    {
        var item = tarr[i];
        if (!common.isNull(item) && item.indexOf('.gif">') > 0)
        {
            var emoti = ':)';
            pos = item.indexOf('.gif');
            if (pos > 0)
            {
                emoti = item.substring(0, pos);
                pos = emoti.lastIndexOf('/');
                if (pos > 0) { emoti = emoti.substr(pos + 1); }
            }
            
            switch (emoti)
            {
                case 'Smiling':emoti = ':)'; break;
                case 'Sad':emoti = ':('; break;
                case 'Laughing':emoti = ':))'; break;
                case 'Winking':emoti = ';)'; break;
                case 'Surprised':emoti = ':-O'; break;
                case 'StraightFace':emoti = ':|'; break;
                case 'Worried':emoti = ':-S'; break;
                case 'Crying':emoti = ':(('; break;
                case 'Cool':emoti = 'B-)'; break;
                case 'Angel':emoti = ':-O)'; break;
                case 'Kiss':emoti = ':x'; break;
                case 'Idea':emoti = ':-I'; break;
                case 'Thinking':emoti = ':-?'; break;
            }
            
            tarr[i] = emoti + item.substring(item.indexOf('.gif">') + 6);
        }
    }
    
    for (var i = 0; i < tarr.length; i++)
    {
        txt = txt + tarr[i];
    }
    
    return txt;
    } catch(err) { common.PutToDebugLogException(2, "_message: RemoveEmoticon", err); }
    return txtin;
}

function onStop(event)
{
    try{
    common.PutToDebugLog(4, "EVENT, _message: onStop");
    global.isMessageStarted = false;
    sendrec = false;
    
    document.getElementById('msgpick_input').value = '';
    document.getElementById('msg_list').innerHTML = '';
//--    document.getElementById('msg_textarea').value = '';
    document.getElementById('msg_textarea').innerHTML = '';
    document.getElementById('msg_charcount').innerHTML = '0';
    document.getElementById('msgpick_container').style.display = 'none';
    
    mAction = '';
    msgSent = false;
    mTo = '';
    mMessage = '';
    mContent = '';
    placeholderhidden = false;
    
    common.SaveContactsFile(function (issaved) { common.PutToDebugLog(4, 'EVENT, _message: onDestroy SaveContactsFile: ' + issaved.toString()); });

    } catch(err) { common.PutToDebugLogException(2, "_message: onStop", err); }
}

function onDestroy (event){} // deprecated by onstop

var message_public = {

    DisplayPresence: DisplayPresence
};
window.message_public = message_public;

// public members and methods
return {
    onCreate: onCreate,
    onStart: onStart,
    onStop: onStop,
    onDestroy: onDestroy,
    
    ShowIncomingMessage: ShowIncomingMessage,
    SaveMissedIncomingMessage: SaveMissedIncomingMessage,
    RefreshPresence: RefreshPresence,
};
})();