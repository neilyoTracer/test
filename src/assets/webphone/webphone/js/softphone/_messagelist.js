//--define(['jquery', 'common', 'stringres', 'global'], function($, common, stringres, global)
wpa._messagelist = (function ()
{
function onCreate (event) // called only once - bind events here
{
    try{
    common.PutToDebugLog(4, "EVENT, _messagelist: onCreate");
    
    j$('#messagelist_list').on('click', 'li', function(event)
    {
        OnListItemClick(j$(this).attr('id'));
    });
    
    j$('#messagelist_notification_list').on('click', '.nt_anchor', function(event)
    {
        j$("#messagelist_not").panel( "close" );
        common.NotificationOnClick2(j$(this).attr('id'), false);
    });
    j$('#messagelist_notification_list').on('click', '.nt_menu', function(event)
    {
        j$("#messagelist_not").panel( "close" );
        common.NotificationOnClick2(j$(this).attr('id'), true);
    });
    
    j$("#messagelist_not_btn").on("click", function()
    {
        common.SaveParameter('notification_count2', 0);
        common.ShowNotifications2(); // repopulate notifications (hide red dot number)
    });
    
    j$( window ).resize(function() // window resize handling
    {
        if (j$.mobile.activePage.attr('id') === 'page_messagelist')
        {
            MeasureMessagelist();
        }
    });
    
    j$('#messagelist_menu_ul').on('click', 'li', function(event)
    {
        MenuItemSelected(j$(this).attr('id'));
    });
    j$("#btn_messagelist_menu").on("click", function() { CreateOptionsMenu('#messagelist_menu_ul'); });
    j$("#btn_messagelist_menu").attr("title", stringres.get("hint_menu"));
    

    j$("#msglist_btnback").attr("title", stringres.get("hint_btnback"));

    j$("#btn_newmessage").on("click", function() { NewMessage(); });
        
    } catch(err) { common.PutToDebugLogException(2, "_messagelist: onCreate", err); }
}

function onStart(event)
{
    try{
    common.PutToDebugLog(4, "EVENT, _messagelist: onStart");
    global.isMessagelistStarted = true;
    
//--    j$("#phone_number").attr("placeholder", stringres.get("phone_nr"));
//--    document.getElementById("app_name_messagelist").innerHTML = common.GetBrandName();
    j$('#btn_newmessage').html(stringres.get('btn_new_message'));
    
    j$(".separator_line_thick").css( 'background-color', common.HoverCalc(common.getBgColor('#page_messagelist'), -30) );
    
    if (!common.isNull(document.getElementById('msglist_title')))
    {
        document.getElementById('msglist_title').innerHTML = stringres.get("msglist_title");
    }
    j$("#msglist_title").attr("title", stringres.get("hint_page"));

    if (!common.isNull(document.getElementById('msglist_btnback')))
    {
        document.getElementById('msglist_btnback').innerHTML = '<b>&LT;</b>&nbsp;' + stringres.get("go_back_btn_txt");
    }
    
// needed for proper display and scrolling of listview
    MeasureMessagelist();
    common.HideMessageNotifications2(); // show only call notification
    
    // fix for IE 10
    if (common.IsIeVersion(10)) { j$("#messagelist_list").children().css('line-height', 'normal'); }
    if (common.IsIeVersion(10)) { j$("#messagelist_notification_list").children().css('line-height', 'normal'); }
    j$("#messagelist_notification_list").height(common.GetDeviceHeight() - 55);
    
    PopulateList();
    
    } catch(err) { common.PutToDebugLogException(2, "_messagelist: onStart", err); }
}

function MeasureMessagelist() // resolve window height size change
{
    try{
//--    var pgh = common.GetDeviceHeight() - 1; j$('#page_messagelist').css('min-height', pgh + 'px'); // must be set when softphone is skin in div
    j$('#page_messagelist').css('min-height', 'auto'); // must be set when softphone is skin in div
    
// handle notifiaction      additional_header_right
    var notwidth = common.GetDeviceWidth() - j$("#messagelist_additional_header_left").width() - j$("#messagelist_additional_header_right").width();
    var margin = common.StrToIntPx( j$("#messagelist_additional_header_left").css("margin-left") );
    
    if (common.isNull(margin) || margin === 0) { margin = 10; }
    margin = Math.ceil( margin * 6 );
    notwidth = Math.floor(notwidth - margin) - 20;

// handle page height
    var heightTemp = common.GetDeviceHeight() - j$("#messagelist_header").height() - j$("#btn_newmessage_container").height();

    heightTemp = Math.floor( heightTemp - 3 );
    j$("#messagelist_list").height(heightTemp);
    
    } catch(err) { common.PutToDebugLogException(2, "_messagelist: MeasureMessagelist", err); }
}

function LoadMessages()
{
    try{
    PopulateList();

//--    if (global.isdebugversionakos)
//--    {
//--        if ( common.isNull(global.ctlist) || global.ctlist.length < 1 )
//--        {
//--            global.ctlist = [];
//--            // String Name, String[] {numbers/sip uris}, String[] {number types}, int usage, long lastmodified, int delete flag, int isfavorit
//--            var ctitem = ['Ambrus Akos', ['40724335358', '0268123456', '13245679'], ['home', 'work', 'other'], '0', '13464346', '0', '0'];

//--            var ctitem2 = ['Ambrus Tunde', ['123456', '987654'], ['other', 'fax_home'], '0', '23464346', '0', '0'];
//--            var ctitem3 = ['Mariska Mari', ['123456', '987654'], ['other', 'fax_home'], '0', '23464346', '0', '0'];
//--            global.ctlist.push(ctitem); global.ctlist.push(ctitem2); global.ctlist.push(ctitem3);
            
//--            for (var i = 0; i < 12; i++)
//--            {
//--                var ctitem_generated = ['Test_' + i, ['123456_' + i, '987654_' + i], ['other', 'fax_home'], '0', '23464346', '0', '0'];
//--                global.ctlist.push(ctitem_generated);
//--            }
//--        }
//--    }
    
//--    if (common.isNull(global.ctlist) || global.ctlist.length < 1)
//--    {
//--        common.GetContacts(function (success)
//--        {
//--            if (!success)
//--            {
//--                common.PutToDebugLog(2, 'ERROR, _messagelist: LoadContacts failed');
//--            }
//--            PopulateList();
//--        });
//--    }else
//--    {
//--        PopulateList();
//--    }
    } catch(err) { common.PutToDebugLogException(2, "_messagelist: LoadMessages", err); }
}

function PopulateList() // :no return value
{
    try{
    if ( common.isNull(document.getElementById('messagelist_list')) )
    {
        common.PutToDebugLog(2, "ERROR, _messagelist: PopulateList listelement is null");
        return;
    }
    j$('#messagelist_list').html('');

    // filenames: sms/chat_username_number

//-- isdebugversionakos
//    type_myusername_tousername[#nrofmissedmsg
//    var msgfilestest = 'sms_9999_1111[#3,chat_9999_2222,chat_9999_3333,sms_9999_4444,sms_9999_5555,sms_9999_6666';
//    common.SaveParameter('messagefiles', msgfilestest);
    
    var files = common.GetParameter('messagefiles');
    
    if (common.isNull(files) || files.length < 3)
    {
        common.PutToDebugLog(3, 'EVENT, _messagelist: PopulateList no message files');
        return;
    }
    
    common.PutToDebugLog(2, 'EVENT, _messagelist Starting populate list');
    
    var msglist = [];
    
    if (!common.isNull(files) && files.length > 0)
    {
        msglist = files.split(',');
    }

    var listview = '';
    
    for (var i = 0; i < msglist.length; i++)
    {
        if (common.isNull(msglist[i]) || msglist[i].length < 3) { continue; }
        
        var number = msglist[i].substring( msglist[i].lastIndexOf('_') + 1 );
        var type = msglist[i].substring(0, msglist[i].indexOf('_') );
        var missedmsg = '';
        var nrMissed = 0;

// check if there are missed messages
        var pos = number.indexOf('[#');
        if (pos > 0)
        {
            var tmp = number.substring(pos + 2, number.length);
            number = number.substring(0, pos);
            
            try{ nrMissed = common.StrToInt( common.Trim(tmp) ); } catch(errin) {  }
        }
        
        var name = common.GetContactNameFromNumber(number);
        
        if (!common.isNull(nrMissed) && nrMissed > 0)
        {
            missedmsg = '<span class="ui-li-count">' + nrMissed + '</span>';
        }
        
        if (common.isNull(name) || name.length < 1) { name = number; }
        
        var listitem = '' +
            '<li id="msgitem_' + i + '"><a class="msg_anchor mlistitem" data-transition="slide">' +
                '<div class="msg_item_container">' +
                    '<div class="msg_name">' + name + ' - <span id="msgitemnumber_' + i + '">' + number + '</span>' + missedmsg + '</div>' +
                    //'<div class="new_msg_count">4</div>' +//(3) new missed message count
                    '<div id="msgtype_' + i + '" class="msg_type">' + stringres.get(type) + '</div>' +
		'</div>' +
            '</a></li>';

        listview = listview + listitem;
    }
    
    j$('#messagelist_list').html('');
    j$('#messagelist_list').append(listview).listview('refresh');
    
    } catch(err) { common.PutToDebugLogException(2, "_messagelist: PopulateList", err); }
}

function OnListItemClick (id) // :no return value
{
    try{
        
    if (common.isNull(id) || id.length < 1)
    {
        common.PutToDebugLog(2, 'ERROR, _messagelist OnListItemClick id is NULL');
        return;
    }
    
    var msgid = '';
    var pos = id.indexOf('_');
    if (pos < 2)
    {
        common.PutToDebugLog(2, 'ERROR, _messagelist OnListItemClick invalid id');
        return;
    }
    
    msgid = common.Trim(id.substring(pos + 1));
    
    var to = j$('#msgitemnumber_' + msgid).html();
    if (common.isNull(to)) { to = ''; }else{ to = common.Trim(to); }
    
    var typestr = j$('#msgtype_' + msgid).html();
    if (common.isNull(typestr)) { typestr = stringres.get('chat'); }else{ typestr = common.Trim(typestr); }
    
    var action = '';
    if (typestr === stringres.get('chat'))
    {
        action = 'chat';
    }else if (typestr === stringres.get('sms'))
    {
        action = 'sms';
    }
    
//--    webphone_api.sendchat (1, to, '', action);

    global.intentmsg[0] = 'action=' + action;
    global.intentmsg[1] = 'to=' + to;
    global.intentmsg[2] = 'message=';
    
    if (common.GetParameter('devicetype') === common.DEVICE_WIN_SOFTPHONE())
    {
        j$.mobile.changePage("#page_message", { transition: "none", role: "page" });    
    }else
    {
        j$.mobile.changePage("#page_message", { transition: "slide", role: "page" });    
    }
    
    } catch(err) { common.PutToDebugLogException(2, "_messagelist: OnListItemClick", err); }
}

function NewMessage()
{
    try{
    common.StartMsg('', '', '_messagelist');
    
    } catch(err) { common.PutToDebugLogException(2, "_messagelist: NewMessage", err); }
}

var MENUITEM_MESSAGELIST_NEWMESSAGE = '#menuitem_messagelist_newmessage';
var MENUITEM_MESSAGELIST_DELETE = '#menuitem_messagelist_delete';

function CreateOptionsMenu (menuId) // adding items to menu, called from html
{
    try{
// remove data transition for windows softphone, because it's slow
    if (common.IsWindowsSoftphone())
    {
        j$( "#btn_messagelist_menu" ).removeAttr('data-transition');
    }

    if ( common.isNull(menuId) || menuId.lenght < 1 ) { common.PutToDebugLog(2, "ERROR, _messagelist: CreateOptionsMenu menuid null"); return; }

    if (j$(menuId).length <= 0) { common.PutToDebugLog(2, "ERROR, _messagelist: CreateOptionsMenu can't get reference to Menu"); return; }
    
    if (menuId.charAt(0) !== '#') { menuId = '#' + menuId; }
    
    j$(menuId).html('');
    j$(menuId).append( '<li id="' + MENUITEM_MESSAGELIST_NEWMESSAGE + '"><a data-rel="back">' + stringres.get('btn_new_message') + '</a></li>' ).listview('refresh');
    
    j$(menuId).append( '<li id="' + MENUITEM_MESSAGELIST_DELETE + '"><a data-rel="back">' + stringres.get('delete_text') + '</a></li>' ).listview('refresh');
    
    return true;
    
    } catch(err) { common.PutToDebugLogException(2, "_messagelist: CreateOptionsMenu", err); }
    
    return false;
}

function MenuItemSelected(itemid)
{
    try{
    if (common.isNull(itemid) || itemid.length < 1) { return; }
    
    j$( '#messagelist_menu' ).on( 'popupafterclose', function( event )
    {
        j$( '#messagelist_menu' ).off( 'popupafterclose' );
        
        switch (itemid)
        {
            case MENUITEM_MESSAGELIST_NEWMESSAGE:
                NewMessage();
                break;
            case MENUITEM_MESSAGELIST_DELETE:
                ClearAllHistory();
                break;
        }
    });
    } catch(err) { common.PutToDebugLogException(2, "_messagelist: MenuItemSelected", err); }
}

function ClearAllHistory(popupafterclose)
{
    try{
    var files = common.GetParameter('messagefiles');
    
    if (common.isNull(files) || files.length < 3)
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
        '<span> ' + stringres.get('delete_all_msg_alert') + ' </span>' +
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
        var msglist = files.split(',');
    
        for (var i = 0; i < msglist.length; i++)
        {
            if (common.isNull(msglist[i]) || msglist[i].length < 3) { continue; }

// cut off number of missed messages from file names
            var pos = msglist[i].indexOf('[#');
            if (pos > 0)
            {
                msglist[i] = msglist[i].substring(0, pos);
            }

            global.File.DeleteFile(msglist[i], function (success)
            {
                common.PutToDebugLog(3, 'EVENT, _messagelist: ClearAllHistory DeleteFile: ' + msglist[i] + ' status: ' + success.toString());
            });
        }

        common.SaveParameter('messagefiles', '');
        PopulateList();
    });
    } catch(err) { common.PutToDebugLogException(2, "_messagelist: ClearAllHistory", err); }
}

function onStop(event)
{
    try{
    common.PutToDebugLog(4, "EVENT, _messagelist: onStop");
    global.isMessagelistStarted = false;

    } catch(err) { common.PutToDebugLogException(2, "_messagelist: onStop", err); }
}

function onDestroy (event){} // deprecated by onstop

// public members and methods
return {
    onCreate: onCreate,
    onStart: onStart,
    onStop: onStop,
    onDestroy: onDestroy
};
})();