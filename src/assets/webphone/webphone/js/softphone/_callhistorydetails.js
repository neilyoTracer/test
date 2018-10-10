// Call History Details page
//--define(['jquery', 'common', 'stringres', 'global'], function($, common, stringres, global)
wpa._callhistorydetails = (function ()
{
var ctid = -1;
var chentry = null;

function onCreate (event)
{
    try{
    common.PutToDebugLog(4, "EVENT, _callhistorydetails: onCreate");

    j$( window ).resize(function() // window resize handling
    {
        if (j$.mobile.activePage.attr('id') === 'page_callhistorydetails')
        {
            MeasureCallhistorydetails();
        }
    });
    
    j$('#callhistorydetails_menu_ul').on('click', 'li', function(event)
    {
        MenuItemSelected(j$(this).attr('id'));
    });
    j$("#btn_callhistorydetails_menu").on("click", function() { CreateOptionsMenu('#callhistorydetails_menu_ul'); });
    j$("#btn_callhistorydetails_menu").attr("title", stringres.get("hint_menu"));
        
    } catch(err) { common.PutToDebugLogException(2, "_callhistorydetails: onCreate", err); }
}

function onStart(event)
{
    try{
    common.PutToDebugLog(4, "EVENT, _callhistorydetails: onStart");
    global.isCallhistorydetailsStarted = true;
    
//--    document.getElementById("app_name_callhistorydetails").innerHTML = common.GetBrandName();
    j$(".separator_line_thick").css( 'background-color', common.HoverCalc(common.getBgColor('#page_callhistorydetails'), -30) );
    
    if (!common.isNull(document.getElementById('callhistorydetails_title')))
    {
        document.getElementById('callhistorydetails_title').innerHTML = stringres.get("chdetails_title");
    }
    j$("#callhistorydetails_title").attr("title", stringres.get("hint_page"));

    if (!common.isNull(document.getElementById('chdetails_btnback')))
    {
        document.getElementById('chdetails_btnback').innerHTML = '<b>&LT;</b>&nbsp;' + stringres.get("chdetails_btnback_txt");
    }

// needed for proper display of page height
    MeasureCallhistorydetails();
    
    try { ctid = common.StrToInt( common.GetIntentParam(global.intentchdetails, 'ctid') ); } catch(err) { common.PutToDebugLogException(2, "_callhistorydetails: onStart can't convert ctid to INT", err); }
    
    chentry = global.chlist[ctid];
    PopulateData();
    
    } catch(err) { common.PutToDebugLogException(2, "_callhistorydetails: onStart", err); }
}

function MeasureCallhistorydetails() // resolve window height size change
{
    try{
//--    var pgh = common.GetDeviceHeight() - 1; j$('#page_callhistorydetails').css('min-height', pgh + 'px'); // must be set when softphone is skin in div
    j$('#page_callhistorydetails').css('min-height', 'auto'); // must be set when softphone is skin in div

    var heightTemp = common.GetDeviceHeight() - j$("#callhistorydetails_header").height();
    heightTemp = heightTemp - 3;
    j$("#page_callhistorydetails_content").height(heightTemp);
    
    } catch(err) { common.PutToDebugLogException(2, "_callhistorylist: MeasureCallhistorydetails", err); }
}

function PopulateData()
{
    try{
    if (common.isNull(chentry) || chentry.length < 1)
    {
        common.PutToDebugLog(2, 'ERROR, _callhistorydetails PopulateData entry is NULL');
        return;
    }
    
    j$("#page_callhistorydetails_content").html('');
    
    var content = '<div id="ch_contact_name">' + chentry[common.CH_NAME] + '</div>';

    var number = chentry[common.CH_NUMBER];
    var type = chentry[common.CH_TYPE];
    
    var typestr = '';
    if (type === '0') { typestr = stringres.get('ch_outgoing'); }
    else if (type === '1') { typestr = stringres.get('ch_incoming'); }
    else { typestr = stringres.get('ch_missed'); }
    
    
    if (!common.isNull(number) && number.length > 0)
    {
        var itemCall = 
            '<div id="ch_entry" class="ch_container">' +
            '<div id="ch_call_entry" class="ch_call">' +
            	'<div class="ch_data">' +
                    '<div class="ch_type">' + typestr + '</div>' +
                    '<div class="ch_number">' + chentry[common.CH_NUMBER] + '</div>' +
                '</div>' +
                '<div class="ch_icon">' +
                    '<img src="' + common.GetElementSource() + 'images/icon_call.png" />' +
                '</div>' +
            '</div>' +
        '</div>';

        var itemMsg = 
            '<div id="ch_entry" class="ch_container">' +
            '<div id="ch_msg_entry" class="ch_call">' +
            	'<div class="ch_data">' +
                    '<div class="ch_type">' + stringres.get('send_msg') + '</div>' +
                    '<div class="ch_number">' + chentry[common.CH_NUMBER] + '</div>' +
                '</div>' +
                '<div class="ch_icon">' +
                    '<img src="' + common.GetElementSource() + 'images/icon_message.png" />' +
                '</div>' +
            '</div>' +
        '</div>';

        var itemVideo = '';
        if (common.GetParameter2('video') === '1' || (common.GetParameter2('video') === '-1' && common.getuseengine() === global.ENGINE_WEBRTC))
        {
            itemVideo = 
                '<div id="ch_entry" class="ch_container">' +
                '<div id="ch_video_entry" class="ch_call">' +
                    '<div class="ch_data">' +
                        '<div class="ch_type">' + stringres.get('video_call') + '</div>' +
                        '<div class="ch_number">' + chentry[common.CH_NUMBER] + '</div>' +
                    '</div>' +
                    '<div class="ch_icon">' +
                        '<img src="' + common.GetElementSource() + 'images/btn_video_txt.png" />' +
                    '</div>' +
                '</div>' +
            '</div>';
        }
        
//-- handle hidesettings
        if (common.HideSettings('chat', stringres.get('sett_display_name_' + 'chat'), 'chat', true) === true)
        {
            itemMsg = '';
        }

        if (common.CanIUseVideo() === false) { itemVideo = ''; }

        content = content + itemCall + itemMsg + itemVideo;
    }

    j$("#page_callhistorydetails_content").html(content);

// add event listeners
    if (!common.isNull(number) && number.length > 0)
    {
        j$('#ch_call_entry').on('click', function() { OnItemClick(0); });
        j$('#ch_msg_entry').on('click', function() { OnItemClick(1); });
        j$('#ch_video_entry').on('click', function() { OnItemClick(2); });
    }
    } catch(err) { common.PutToDebugLogException(2, "_callhistorydetails: PopulateData", err); }
}

var trigerred = false; // handle multiple clicks
function OnItemClick(type)  // type: 0=call, 1=chat, 2=video call
{
    try{
    if (trigerred) { return; }
    
    trigerred = true;
    setTimeout(function ()
    {
        trigerred = false;
    }, 1000);

    if (type === 0)
    {
        StartCall(false);
    }
    else if (type === 1)
    {
        StartChatSms();
    }
    else if (type === 2)
    {
        StartCall(true);
    }
    } catch(err) { common.PutToDebugLogException(2, "_callhistorydetails: OnItemClick", err); }
}

function StartCall(isvideo)
{
    try{
    common.SaveParameter('redial', chentry[common.CH_NUMBER]);
    
    common.PutToDebugLog(4, 'EVENT, _callhistorydetails initiate call to: ' + chentry[common.CH_NUMBER]);
    
    setTimeout(function () //-- timeout, so j$.mobile.back(); won't close call page
    {
        if (isvideo === true)
        {
            webphone_api.videocall(chentry[common.CH_NUMBER]);
        }else
        {
            //webphone_api.call(-1, chentry[common.CH_NUMBER], chentry[common.CH_NAME]);
            webphone_api.call(chentry[common.CH_NUMBER], -1);
        }
    }, 100);

    j$.mobile.back();

//--    setTimeout(function ()
//--    {
//--        j$.mobile.changePage("#page_call", { transition: "pop", role: "page" });
//--    }, 20);
    
//--    j$.mobile.changePage("#page_call", { transition: "pop", role: "page" });

    } catch(err) { common.PutToDebugLogException(2, "_callhistorydetails: StartCall", err); }
}

function StartChatSms()
{
    try{
    common.StartMsg(chentry[common.CH_NUMBER], '', '_callhistorydetails');

    } catch(err) { common.PutToDebugLogException(2, "_callhistorydetails: StartChatSms", err); }
}

var MENUITEM_CALLHISTORYDETAILS_CREATE = '#menuitem_callhistorydetails_create';
var MENUITEM_CALLHISTORYDETAILS_EDIT = '#menuitem_callhistorydetails_edit';
var MENUITEM_CALLHISTORYDETAILS_CALL = '#menuitem_callhistorydetails_call';
var MENUITEM_CALLHISTORYDETAILS_MESSAGE = '#menuitem_callhistorydetails_message';

function CreateOptionsMenu (menuId) // adding items to menu, called from html
{
    try{
// remove data transition for windows softphone, because it's slow
    if (common.IsWindowsSoftphone())
    {
        j$( "#btn_callhistorydetails_menu" ).removeAttr('data-transition');
    }

    if ( common.isNull(menuId) || menuId.lenght < 1 ) { common.PutToDebugLog(2, "ERROR, _callhistorydetails: CreateOptionsMenu menuid null"); return; }

    if (j$(menuId).length <= 0) { common.PutToDebugLog(2, "ERROR, _callhistorydetails: CreateOptionsMenu can't get reference to Menu"); return; }
    
    if (menuId.charAt(0) !== '#') { menuId = '#' + menuId; }
    
    j$(menuId).html('');
    if (common.GetContactIdFromNumber(chentry[common.CH_NUMBER]) < 0)	// check if contact exists
    {
        j$(menuId).append( '<li id="' + MENUITEM_CALLHISTORYDETAILS_CREATE + '"><a data-rel="back">' + stringres.get('menu_createcontact') + '</a></li>' ).listview('refresh');
    }else
    {
        j$(menuId).append( '<li id="' + MENUITEM_CALLHISTORYDETAILS_EDIT + '"><a data-rel="back">' + stringres.get('menu_editcontact') + '</a></li>' ).listview('refresh');
    }
    
    j$(menuId).append( '<li id="' + MENUITEM_CALLHISTORYDETAILS_CALL + '"><a data-rel="back">' + stringres.get('menu_call') + '</a></li>' ).listview('refresh');
    
// handle hidesettings
    if (common.HideSettings('chat', stringres.get('sett_display_name_' + 'chat'), 'chat') === false, true)
    {
        j$(menuId).append( '<li id="' + MENUITEM_CALLHISTORYDETAILS_MESSAGE + '"><a data-rel="back">' + stringres.get('menu_message') + '</a></li>' ).listview('refresh');
    }

    return true;
    
    } catch(err) { common.PutToDebugLogException(2, "_callhistorydetails: CreateOptionsMenu", err); }
    
    return false;
}

function MenuItemSelected(itemid)
{
    try{
    if (common.isNull(itemid) || itemid.length < 1) { return; }
    
    j$( '#callhistorydetails_menu' ).on( 'popupafterclose', function( event )
    {
        j$( '#callhistorydetails_menu' ).off( 'popupafterclose' );
        
        switch (itemid)
        {
            case MENUITEM_CALLHISTORYDETAILS_CREATE:
                CreateContact();
                break;
            case MENUITEM_CALLHISTORYDETAILS_EDIT:
                EditContact();
                break;
            case MENUITEM_CALLHISTORYDETAILS_CALL:
                StartCall();
                break;
            case MENUITEM_CALLHISTORYDETAILS_MESSAGE:
                StartChatSms();
                break;
        }
    });
    } catch(err) { common.PutToDebugLogException(2, "_callhistorydetails: MenuItemSelected", err); }
}

function CreateContact()
{
    try{
    global.intentaddeditct[0] = 'action=add';
    global.intentaddeditct[1] = 'numbertoadd=' + chentry[common.CH_NUMBER];
    var name = chentry[common.CH_NAME];
    if (common.isNull(name) || name.length < 1 || name === chentry[common.CH_NUMBER]) { name = ''; }
    global.intentaddeditct[2] = 'nametoadd=' + name;
    
    j$.mobile.changePage("#page_addeditcontact", { transition: "pop", role: "page" });
    
    } catch(err) { common.PutToDebugLogException(2, "_callhistorydetails: CreateContact", err); }
}

function EditContact()
{
    try{
    var ctid = common.GetContactIdFromNumber(chentry[common.CH_NUMBER]);
    
    if (ctid < 0) // means there is no contact found
    {
        CreateContact();
        return;
    }

    global.intentaddeditct[0] = 'action=edit';
    global.intentaddeditct[1] = 'ctid=' + ctid;
    
    j$.mobile.changePage("#page_addeditcontact", { transition: "pop", role: "page" });

    } catch(err) { common.PutToDebugLogException(2, "_callhistorydetails: EditContact", err); }
}

function onStop(event)
{
    try{
    common.PutToDebugLog(4, "EVENT, _callhistorydetails: onStop");
    global.isCallhistorydetailsStarted = false;
    j$("#page_callhistorydetails_content").html('');
    
    } catch(err) { common.PutToDebugLogException(2, "_callhistorydetails: onStop", err); }
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