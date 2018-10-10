// Call History List page
//--define(['jquery', 'common', 'stringres', 'global'], function($, common, stringres, global)
wpa._callhistorylist = (function ()
{
function onCreate (event) // called only once - bind events here
{
    try{
    common.PutToDebugLog(4, "EVENT, _callhistorylist: onCreate");
    
//-- navigation done with js, so target URL will not be displayed in browser statusbar
    j$("#nav_ch_dialpad").on("click", function()
    {
        j$.mobile.changePage("#page_dialpad", { transition: "none", role: "page", reverse: "true" });
    });
    j$("#nav_ch_contacts").on("click", function()
    {
        j$.mobile.changePage("#page_contactslist", { transition: "none", role: "page", reverse: "true" });
    });
    
    j$("#nav_ch_dialpad").attr("title", stringres.get("hint_dialpad"));
    j$("#nav_ch_contacts").attr("title", stringres.get("hint_contacts"));
    j$("#nav_ch_callhistory").attr("title", stringres.get("hint_callhistory"));
    j$("#callhistorylist_not_btn").on("click", function()
    {
        common.SaveParameter('notification_count2', 0);
        common.ShowNotifications2(); // repopulate notifications (hide red dot number)
    });
    
    j$("#status_callhistorylist").attr("title", stringres.get("hint_status"));
    j$("#curr_user_callhistorylist").attr("title", stringres.get("hint_curr_user"));
    
    j$('#callhistorylist_notification_list').on('click', '.nt_anchor', function(event)
    {
        j$("#callhistorylist_not").panel( "close" );
        common.NotificationOnClick2(j$(this).attr('id'), false);
    });
    j$('#callhistorylist_notification_list').on('click', '.nt_menu', function(event)
    {
        j$("#callhistorylist_not").panel( "close" );
        common.NotificationOnClick2(j$(this).attr('id'), true);
    });


    j$( window ).resize(function() // window resize handling
    {
        if (j$.mobile.activePage.attr('id') === 'page_callhistorylist')
        {
            MeasureCallhistorylist();
        }
    });
    
    j$('#callhistorylist_list').on('click', 'li', function(event)
    {
        OnListItemClick(j$(this).attr('id'));
    });
    
    j$('#callhistorylist_list').on('taphold', 'li', function(event)
    {
        OnListItemLongClick(j$(this).attr('id'));
    });
    
    j$('#callhistorylist_menu_ul').on('click', 'li', function(event)
    {
        MenuItemSelected(j$(this).attr('id'));
    });
    j$("#btn_callhistorylist_menu").on("click", function() { CreateOptionsMenu('#callhistorylist_menu_ul'); });
    j$("#btn_callhistorylist_menu").attr("title", stringres.get("hint_menu"));
    
    var advuri = common.GetParameter('advertisement');
    if (!common.isNull(advuri) && advuri.length > 5)
    {
        j$('#advert_callhistorylist_frame').attr('src', advuri);
        j$('#advert_callhistorylist').show();
    }
    
    if (common.UsePresence2() === true)
    {
        j$("#callhistorylist_additional_header_left").on("click", function()
        {
            common.PresenceSelector('callhistorylist');
        });
        j$("#callhistorylist_additional_header_left").css("cursor", "pointer");
    }
        
    } catch(err) { common.PutToDebugLogException(2, "_callhistorylist: onCreate", err); }
}

function onStart(event)
{
    try{
    common.PutToDebugLog(4, "EVENT, _callhistorylist: onStart");
    global.isCallhistorylistStarted = true;
    
    if (common.HideSettings('page_contacts', '', 'page_contacts', true))
    {
        j$("#li_nav_ch_ct").remove();
        var count = j$("#ul_nav_ch").children().length;
        var tabwidth = Math.floor(100 / count);
        
        j$('#ul_nav_ch').children('li').each(function ()
        {
            j$(this).css('width', tabwidth + '%');
        });
        
        if (count < 2)
        {
            j$('#ul_nav_ch').remove();
            MeasureDialPad();
        }
    }

    if (common.GetParameter('devicetype') !== common.DEVICE_WIN_SOFTPHONE())
    {
        document.getElementById("app_name_callhistorylist").innerHTML = common.GetBrandName();
    }
    j$(".separator_line_thick").css( 'background-color', common.HoverCalc(common.getBgColor('#page_callhistorylist'), -30) );
    
    if (!common.isNull(document.getElementById('chlist_title')))
    {
        document.getElementById('chlist_title').innerHTML = stringres.get('chlist_title');
    }
    j$("#chlist_title").attr("title", stringres.get("hint_page"));
    
    var curruser = common.GetParameter('sipusername');
    if (!common.isNull(curruser) && curruser.length > 0) { j$('#curr_user_callhistorylist').html(curruser); }
// set status width so it's uses all space to curr_user
    var statwidth = common.GetDeviceWidth() - j$('#curr_user_callhistorylist').width() - 25;
    if (!common.isNull(statwidth) && common.IsNumber(statwidth))
    {
        j$('#status_callhistorylist').width(statwidth);
    }
    
    if ((common.GetParameter('header')).length > 2)
    {
        j$('#headertext_callhistorylist').show();
        j$('#headertext_callhistorylist').html(common.GetParameter('header'));
    }else
    {
        j$('#headertext_callhistorylist').hide();
    }
    if ((common.GetParameter('footer')).length > 2)
    {
        j$('#footertext_callhistorylist').show();
        j$('#footertext_callhistorylist').html(common.GetParameter('footer'));
    }else
    {
        j$('#footertext_callhistorylist').hide();
    }
    
    
    if (common.GetConfigInt('brandid', -1) === 58) //-- enikma
    {
        var logodiv = document.getElementById('app_name_callhistorylist');
        if (!common.isNull(logodiv))
        {
            var middle = document.getElementById('chlist_title');
            logodiv.style.display = 'inline';
            if (!common.isNull(middle)) { middle.style.display = 'none'; }
            document.getElementById('callhistorylist_additional_header_left').style.width = '65%';
            logodiv.innerHTML = '<img src="' + common.GetElementSource() + 'images/logo.png" style="border: 0;">&nbsp;&nbsp;&nbsp;<div class="adhead_custom_brand" style=""><b>eNikMa</b> Unified Comm</div>';
        }
    }
    

    common.HideCallNotifications2(); //-- show only message notification    
// needed for proper display and scrolling of listview
    MeasureCallhistorylist();
    
    // fix for IE 10
    if (common.IsIeVersion(10)) { j$("#callhistorylist_list").children().css('line-height', 'normal'); }
    if (common.IsIeVersion(10)) { j$("#callhistorylist_notification_list").children().css('line-height', 'normal'); }
    j$("#callhistorylist_notification_list").height(common.GetDeviceHeight() - 55);
    
    LoadHistory();
    
    common.ShowOfferSaveContact();
    
    } catch(err) { common.PutToDebugLogException(2, "_callhistorylist: onStart", err); }
}

function MeasureCallhistorylist() // resolve window height size change
{
    try{
//--    var pgh = common.GetDeviceHeight() - 1; j$('#page_callhistorylist').css('min-height', pgh + 'px'); // must be set when softphone is skin in div
    j$('#page_callhistorylist').css('min-height', 'auto'); // must be set when softphone is skin in div

// handle notifiaction      additional_header_right
    var notwidth = common.GetDeviceWidth() - j$("#callhistorylist_additional_header_left").width() - j$("#callhistorylist_additional_header_right").width();
    var margin = common.StrToIntPx( j$("#callhistorylist_additional_header_left").css("margin-left") );
    
    if (common.isNull(margin) || margin === 0) { margin = 10; }
    margin = Math.ceil( margin * 6 );
    notwidth = Math.floor(notwidth - margin) - 20;

    j$("#callhistorylist_notification").width(notwidth);
    j$("#callhistorylist_notification").height( Math.floor( j$("#callhistorylist_additional_header_left").height() ) );
    
// handle page height
    var heightTemp = common.GetDeviceHeight() - j$("#callhistorylist_header").height() - 3;
    
    if (j$('#footertext_callhistorylist').is(':visible')) { heightTemp = heightTemp - j$("#footertext_callhistorylist").height(); }
    
    if (j$('#advert_callhistorylist').is(':visible')) { heightTemp = heightTemp - j$("#advert_callhistorylist").height(); }
    
    j$("#callhistorylist_list").height(heightTemp);

    
//--    var brandW = Math.floor(common.GetDeviceWidth() / 3.2);
//--    j$("#app_name_callhistorylist").width(brandW);

    // if brandname does not fit, then hide brandname
    if (global.bname_charcount > 0 && common.GetBrandName().length > global.bname_charcount)
    {
        j$('#app_name_callhistorylist').html('');
        j$('#callhistorylist_additional_header_left').width('35%');
    }
    var brandW = j$("#callhistorylist_additional_header_left").width() - 5;
    if (j$('#callhistorylist_presence').is(':visible')) { brandW = brandW - j$("#callhistorylist_presence").width(); }
    j$("#app_name_callhistorylist").width(brandW);
    
    } catch(err) { common.PutToDebugLogException(2, "_callhistorylist: MeasureCallhistorylist", err); }
}

function LoadHistory()
{
    try{
    if (global.isdebugversionakos)
    {
//--        if ( common.isNull(global.chlist) || global.chlist.length < 1 )
//--        {
//--            global.chlist = [];
            // String call_type, String name, String number, String date, String duration(sec), String recording
            
//--            var chitem = ['0', 'Ambrus Akos', '8888', '1401783666621', '50', ''];

//--            var chitem2 = ['1', 'Ambrus Tunde', '134567915', '1401783646621', '18', ''];
//--            var chitem3 = ['2', '469879797973', '469879797973', '1401783662621', '85', ''];
//--            var chitem3 = ['2', '46987979797', '46987979797', '1401783662621', '85', ''];
//--            var chitem4 = ['3', 'Bela Missedcall', '46987979797', '1401783662621', '850', ''];
//--            var chitem4 = ['3', 'Bela Missedcall2', '46987979797', '1401783662621', '850', ''];

//--            global.chlist.push(chitem); global.chlist.push(chitem2); global.chlist.push(chitem3); global.chlist.push(chitem4);
//--            global.chlist.push(chitem); global.chlist.push(chitem2); global.chlist.push(chitem3); global.chlist.push(chitem3);
//--            global.chlist.push(chitem3); global.chlist.push(chitem4);
//--        }
    }
    if (common.isNull(global.chlist) || global.chlist.length < 1)
    {
        common.ReadCallhistoryFile(function (success)
        {
            if (!success)
            {
                common.PutToDebugLog(2, 'ERROR, _callhistorylist: Load call history failed');
            }

            PopulateList();
        });
    }else
    {
        PopulateList();
    }
    } catch(err) { common.PutToDebugLogException(2, "_callhistorylist: LoadHistory", err); }
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

function PopulateList() // :no return value
{
    try{
    if ( common.isNull(document.getElementById('callhistorylist_list')) )
    {
        common.PutToDebugLog(2, "ERROR, _callhistorylist: PopulateList listelement is null");
        return;
    }
    
    if ( common.isNull(global.chlist) || global.chlist.length < 1 )
    {
        j$('#callhistorylist_list').html( '<span style="text-shadow:0 0 0;">' + stringres.get('no_history') + '</span>' );
        common.PutToDebugLog(2, "EVENT, _callhistorylist: PopulateList no history");
        return;
    }
    
    common.PutToDebugLog(2, 'EVENT, _callhistorylist Starting populate list');
    
    var template = '' +
        '<li id="chitem_[CHID]" data-theme="b" title="[HINT_DISC_REASON]"><a [MISSED_NEW] class="ch_anchor mlistitem" data-transition="slide">' +
            '<div class="item_container">' +
                '<div class="ch_type">' +
                    '<img src="' + common.GetElementSource() + 'images/[ICON_CALLTYPE].png" />' +
                '</div>' +
                '<div class="ch_data">' +
                    '<div class="ch_name">[NAME]</div>' +
                    '<div class="ch_number">[NUMBER]</div>' +
                    '<div class="ch_duration">[DURATION]</div>' +//Duration: 02:45
                '</div>' +
                '<div class="ch_date">[DATE]</div>' + // Aug, 26 2013 10:55
            '</div>' +
        '</a></li>';
    var listview = '';
    
    for (var i = 0; i < global.chlist.length; i++)
    {
        var item = global.chlist[i];
        if ( common.isNull(item) || item.length < 1 ) { continue; }
        
        /* type 0=outgoing call, 1=incomming call, 2=missed call - not viewed, 3=missed call - viwed*/
        
        var icon = 'icon_call_missed';
        var missed = '';
        
    // handle filter
        if (global.callhistoryfilter === 0 && item[common.CH_TYPE] !== '0') { continue; }
        else if (global.callhistoryfilter === 1 && item[common.CH_TYPE] !== '1') { continue; }
        else if (global.callhistoryfilter === 2 && (item[common.CH_TYPE] !== '2' && item[common.CH_TYPE] !== '3')) { continue; }
            
        
        if (item[common.CH_TYPE] === '0') { icon = 'icon_call_outgoing'; }
        if (item[common.CH_TYPE] === '1') { icon = 'icon_call_incoming'; }
        
        if (item[common.CH_TYPE] === '2')
        {
            //missed = 'style="background: #ff7500;"';
            
            item[common.CH_TYPE] = '3';
            global.chlist[i] = item;
        }
                
        var datecallint = 0;
        try{
            datecallint = common.StrToInt( common.Trim(item[common.CH_DATE]) );
        
        } catch(errin1) { common.PutToDebugLogException(2, "_callhistorylist: PopulateList convert duration", errin1); }
        
        var durationint = 0;
        try{
            durationint = common.StrToInt( common.Trim(item[common.CH_DURATION]) );
        
        } catch(errin1) { common.PutToDebugLogException(2, "_callhistorylist: PopulateList convert duration", errin1); }

//--Aug, 26 2013 10:55
        var datecall = new Date(datecallint);
        
        var minutes = datecall.getMinutes();
        if (minutes < 10) { minutes = '0' + minutes; }
        
        var day = datecall.getDate(); // getDay returns the day of the week
        if (day < 10) { day = '0' + day; }
        
//--        var seconds = datecall.getSeconds();
//--        if (seconds < 10) { seconds = '0' + seconds; }
        
        var daetcallstr = month[datecall.getMonth()] + ', ' + day + '&nbsp;&nbsp;' + datecall.getFullYear()+ '&nbsp;&nbsp;'
                + datecall.getHours() + ':' + minutes;// + ':' + seconds;
        
        var durationstr = stringres.get('duration') + ' ';
//--        if (durationint > 0)
//--        {
//--            durationint = Math.floor(durationint / 1000);
            var sec = durationint % 60;
            var durationmin = Math.floor(durationint / 60);
            var min = durationmin % 60;
            var hour = Math.floor(durationmin / 60);
            
            if (hour > 0)   { durationstr += hour + ':'; }
            if (min < 10 )  { durationstr += '0'; }             durationstr += min + ':';
            if (sec < 10)   { durationstr += '0'; }             durationstr += sec;
//--        }else
        
        var lisitem = template.replace('[CHID]', i);
        lisitem = lisitem.replace('[ICON_CALLTYPE]', icon);
        lisitem = lisitem.replace('[MISSED_NEW]', missed);
        lisitem = lisitem.replace('[NAME]', item[common.CH_NAME]);
        lisitem = lisitem.replace('[NUMBER]', item[common.CH_NUMBER]);
        lisitem = lisitem.replace('[DURATION]', durationstr);
        lisitem = lisitem.replace('[DATE]', daetcallstr);
        lisitem = lisitem.replace('[HINT_DISC_REASON]', item[common.CH_REASON]);

        listview = listview + lisitem;
    }
    
    j$('#callhistorylist_list').html('');
    j$('#callhistorylist_list').append(listview).listview('refresh');
    
    } catch(err) { common.PutToDebugLogException(2, "_callhistorylist: PopulateList", err); }
}

function OnListItemClick (id) // :no return value
{
    try{
        
    if (common.isNull(id) || id.length < 1)
    {
        common.PutToDebugLog(2, 'ERROR, _callhistorylist OnListItemClick id is NULL');
        return;
    }
    
    var ctid = '';
    var pos = id.indexOf('_');
    if (pos < 2)
    {
        common.PutToDebugLog(2, 'ERROR, _callhistorylist OnListItemClick invalid id');
        return;
    }
    
    ctid = common.Trim(id.substring(pos + 1));
    
    global.intentchdetails[0] = 'ctid=' + ctid;
    j$.mobile.changePage("#page_callhistorydetails", { transition: "none", role: "page" });    
    
    } catch(err) { common.PutToDebugLogException(2, "_callhistorylist: OnListItemClick", err); }
}

function OnListItemLongClick (id) // :no return value
{
    try{
        
    if (common.isNull(id) || id.length < 1)
    {
        common.PutToDebugLog(2, 'ERROR, _callhistorylist OnListItemLongClick id is NULL');
        return;
    }
    
    var chid = '';
    var pos = id.indexOf('_');
    if (pos < 2)
    {
        common.PutToDebugLog(2, 'ERROR, _callhistorylist OnListItemLongClick invalid id 1');
        return;
    }
    
    chid = common.Trim(id.substring(pos + 1));
    if (common.isNull(chid) || chid.length < 1 || !common.IsNumber(chid))
    {
        common.PutToDebugLog(2, 'ERROR, _callhistorylist OnListItemLongClick invalid id 2: ' + chid);
        return;
    }
    
    CreateContextmenu(chid);
    
    } catch(err) { common.PutToDebugLogException(2, "_callhistorylist: OnListItemLongClick", err); }
}

function CreateContextmenu(chid, popupafterclose)
{
    try{
    var chentry = global.chlist[chid];
    var popupWidth = common.GetDeviceWidth();
    if ( !common.isNull(popupWidth) && common.IsNumber(popupWidth) && popupWidth > 100 )
    {
        popupWidth = Math.floor(popupWidth / 1.2);
    }else
    {
        popupWidth = 220;
    }
    
    var list = '';
    var item = '<li id="[ITEMID]"><a data-rel="back">[ITEMTITLE]</a></li>';
    
    var itemTemp = '';
    
    if (common.GetContactIdFromNumber(chentry[common.CH_NUMBER]) < 0)	// check if contact exists
    {
        itemTemp = item.replace('[ITEMID]', '#item_create_contact');
        itemTemp = itemTemp.replace('[ITEMTITLE]', stringres.get('menu_createcontact'));
        list = list + itemTemp;
        itemTemp = '';
    }else
    {
        itemTemp = item.replace('[ITEMID]', '#item_edit_contact');
        itemTemp = itemTemp.replace('[ITEMTITLE]', stringres.get('menu_editcontact'));
        list = list + itemTemp;
        itemTemp = '';
    }
    
    itemTemp = item.replace('[ITEMID]', '#item_delete');
    itemTemp = itemTemp.replace('[ITEMTITLE]', stringres.get('ch_delete'));
    list = list + itemTemp;
    itemTemp = '';

    
    var template = '' +
'<div id="ch_contextmenu" data-role="popup" class="ui-content messagePopup" data-overlay-theme="a" data-theme="a" style="max-width:' + popupWidth + 'px; min-width: ' + Math.floor(popupWidth * 0.6) + 'px;">' +

    '<div data-role="header" data-theme="b">' +
        '<a href="javascript:;" data-role="button" data-icon="delete" data-iconpos="notext" class="ui-btn-right closePopup">Close</a>' +
        '<h1 class="adialog_title">' + chentry[common.CH_NAME] + '</h1>' +
    '</div>' +
    '<div role="main" class="ui-content adialog_content" style="padding: 0; margin: 0;">' +
    
        '<ul id="ch_contextmenu_ul" data-role="listview" data-inset="true" data-icon="false" style="margin: 0;">' +
            list +
        '</ul>' +
//        '<a href="javascript:;" class="ui-btn ui-corner-all ui-shadow ui-btn-inline ui-btn-b" data-rel="back">' + stringres.get('btn_close') + '</a>' +
//        '<a href="javascript:;" class="ui-btn ui-corner-all ui-shadow ui-btn-inline ui-btn-b" data-rel="back" data-transition="flow">Delete</a>' +
    '</div>' +
    '<div data-role="footer" data-theme="b" class="adialog_footer">' +
        '<a href="javascript:;" style="width: 98%;" class="ui-btn ui-corner-all ui-shadow ui-btn-inline ui-btn-b adialog_2button" data-rel="back" data-transition="flow">' + stringres.get('btn_close') + '</a>' +
    '</div>' +
'</div>';
 
    popupafterclose = popupafterclose ? popupafterclose : function () {};

    j$.mobile.activePage.append(template).trigger("create");
//--    j$.mobile.activePage.append(template).trigger("pagecreate");

    j$.mobile.activePage.find(".closePopup").bind("tap", function (e)
    {
        j$.mobile.activePage.find(".messagePopup").popup("close");
    });
    
    
    j$.mobile.activePage.find(".messagePopup").popup().popup("open").bind(
    {
        popupafterclose: function ()
        {
            j$(this).unbind("popupafterclose").remove();
            
            j$('#ch_contextmenu_ul').off('click', 'li');
            
            popupafterclose();
        }
    });
    
   
        
    j$('#ch_contextmenu_ul').on('click', 'li', function(event)
    {
        
        var itemid = j$(this).attr('id');
        
        if (itemid === '#item_delete')
        {        
            global.chlist.splice(chid, 1);
            global.wasChModified = true;
            PopulateList();
        }
        else if (itemid === '#item_create_contact')
        {        
            CreateContact(chid);
        }
        else if (itemid === '#item_edit_contact')
        {        
            EditContact(chid);
        }
    });
    } catch(err) { common.PutToDebugLogException(2, "_callhistorylist: CreateContextmenu", err); }
}

function CreateContact(chid)
{
    try{
    j$( '#ch_contextmenu' ).on( 'popupafterclose', function( event )
    {
        j$( '#ch_contextmenu' ).off( 'popupafterclose' );
        
        var chentry = global.chlist[chid];

        global.intentaddeditct[0] = 'action=add';
        global.intentaddeditct[1] = 'numbertoadd=' + chentry[common.CH_NUMBER];
        var name = chentry[common.CH_NAME];
        if (common.isNull(name) || name.length < 1 || name === chentry[common.CH_NUMBER]) { name = ''; }
        global.intentaddeditct[2] = 'nametoadd=' + name;

        j$.mobile.changePage("#page_addeditcontact", { transition: "pop", role: "page" });
    });
    } catch(err) { common.PutToDebugLogException(2, "_callhistorylist: CreateContact", err); }
}

function EditContact(chid)
{
    try{
    var chentry = global.chlist[chid];
    var ctid = common.GetContactIdFromNumber(chentry[common.CH_NUMBER]);
    
    if (ctid < 0) // means there is no contact found
    {
        CreateContact(chid);
        return;
    }
    
    j$( '#ch_contextmenu' ).on( 'popupafterclose', function( event )
    {
        j$( '#ch_contextmenu' ).off( 'popupafterclose' );

        global.intentaddeditct[0] = 'action=edit';
        global.intentaddeditct[1] = 'ctid=' + ctid;

        j$.mobile.changePage("#page_addeditcontact", { transition: "pop", role: "page" });
    });
    } catch(err) { common.PutToDebugLogException(2, "_callhistorylist: EditContact", err); }
}

var MENUITEM_CALLHISTORYLIST_CLEAR = '#menuitem_callhistorylist_clear';
var MENUITEM_CALLHISTORYLIST_SETTINGS = '#menuitem_callhistorylist_settings';
var MENUITEM_CALLHISTORYLIST_LASTCALLDETAILS = '#menuitem_callhistorylist_lastcalldetails';
var MENUITEM_CALLHISTORYLIST_FILTER = '#menuitem_callhistorylist_filter';
var MENUITEM_HELP = '#menuitem_callhistorylist_help';
var MENUITEM_EXIT = '#menuitem_callhistorylist_exit';

function CreateOptionsMenu (menuId) // adding items to menu, called from html
{
    try{
// remove data transition for windows softphone, because it's slow
    if (common.IsWindowsSoftphone())
    {
        j$( "#btn_callhistorylist_menu" ).removeAttr('data-transition');
    }

    if ( common.isNull(menuId) || menuId.lenght < 1 ) { common.PutToDebugLog(2, "ERROR, _callhistorylist: CreateOptionsMenu menuid null"); return; }

    if (j$(menuId).length <= 0) { common.PutToDebugLog(2, "ERROR, _callhistorylist: CreateOptionsMenu can't get reference to Menu"); return; }
    
    if (menuId.charAt(0) !== '#') { menuId = '#' + menuId; }
    
    j$(menuId).html('');
    var featureset = common.GetParameterInt('featureset', 10);

    if ( !common.isNull(global.chlist) && global.chlist.length > 0 )
    {
        j$(menuId).append( '<li id="' + MENUITEM_CALLHISTORYLIST_CLEAR + '"><a data-rel="back">' + stringres.get('clear_callhistory') + '</a></li>' ).listview('refresh');
        j$(menuId).append( '<li id="' + MENUITEM_CALLHISTORYLIST_FILTER + '"><a data-rel="back">' + stringres.get('menu_filter') + '</a></li>' ).listview('refresh');
    }
    
    j$(menuId).append( '<li id="' + MENUITEM_CALLHISTORYLIST_SETTINGS + '"><a data-rel="back">' + stringres.get('settings_title') + '</a></li>' ).listview('refresh');
    
    if (featureset > 0 && !common.isNull(global.lastcalldetails) && global.lastcalldetails.length > 0)
    {
        j$(menuId).append( '<li id="' + MENUITEM_CALLHISTORYLIST_LASTCALLDETAILS + '"><a data-rel="back">' + stringres.get('menu_lastcalldetails') + '</a></li>' ).listview('refresh');
    }

    var help_title = stringres.get('menu_help') + '...';
    if (common.GetConfigInt('brandid', -1) === 60) { help_title = stringres.get('help_about'); } // 101VOICEDT500
    j$(menuId).append( '<li id="' + MENUITEM_HELP + '"><a data-rel="back">' + help_title + '</a></li>' ).listview('refresh');
    
    if (common.IsWindowsSoftphone())
    {
        j$(menuId).append( '<li id="' + MENUITEM_EXIT + '"><a data-rel="back">' + stringres.get('menu_exit') + '</a></li>' ).listview('refresh');
    }

    return true;
    
    } catch(err) { common.PutToDebugLogException(2, "_callhistorylist: CreateOptionsMenu", err); }
    
    return false;
}

function MenuItemSelected(itemid)
{
    try{
    if (common.isNull(itemid) || itemid.length < 1) { return; }
    
    j$( '#callhistorylist_menu' ).on( 'popupafterclose', function( event )
    {
        j$( '#callhistorylist_menu' ).off( 'popupafterclose' );
        
        switch (itemid)
        {
            case MENUITEM_CALLHISTORYLIST_CLEAR:
                ClearCallhistory();
                break;
            case MENUITEM_CALLHISTORYLIST_SETTINGS:
                common.OpenSettings(true);
                break;
            case MENUITEM_CALLHISTORYLIST_LASTCALLDETAILS:
                common.AlertDialog(stringres.get('menu_lastcalldetails'), webphone_api.getlastcalldetails());
                break;
            case MENUITEM_CALLHISTORYLIST_FILTER:
                Filter();
                break;
            case MENUITEM_HELP:
                common.HelpWindow('callhistorylist');
                break;
            case MENUITEM_EXIT:
                common.Exit();
                break;
        }
    });
    } catch(err) { common.PutToDebugLogException(2, "_callhistorylist: MenuItemSelected", err); }
}

function Filter()
{
    try{
//showing options dialog
    var allchecked = '';
    var outchecked = '';
    var inchecked = '';
    var missedchecked = '';
    
    if (global.callhistoryfilter === -1) { allchecked = 'checked="checked"'; }
    else if (global.callhistoryfilter === 0) { outchecked = 'checked="checked"'; }
    else if (global.callhistoryfilter === 1) { inchecked = 'checked="checked"'; }
    else if (global.callhistoryfilter === 2) { missedchecked = 'checked="checked"'; }
    
    var radiogroup = '<input name="chfilter_all" id="chfilter_all" value="-1" ' + allchecked + ' type="radio">' +
                '<label for="chfilter_all">' + stringres.get('chfilter_all') + '</label>'
        + '<input name="chfilter_out" id="chfilter_out" value="0" ' + outchecked + ' type="radio">' +
                '<label for="chfilter_out">' + stringres.get('chfilter_out') + '</label>'
        + '<input name="chfilter_in" id="chfilter_in" value="1" ' + inchecked + ' type="radio">' +
                '<label for="chfilter_in">' + stringres.get('chfilter_in') + '</label>'
        + '<input name="chfilter_missed" id="chfilter_missed" value="2" ' + missedchecked + ' type="radio">' +
                '<label for="chfilter_missed">' + stringres.get('chfilter_missed') + '</label>';

    var popupHeight = common.GetDeviceHeight();
    if ( !common.isNull(popupHeight) && common.IsNumber(popupHeight) && popupHeight > 100 )
    {
        popupHeight = Math.floor(popupHeight / 1.2);
    }else
    {
        popupHeight = 300;
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
'<div id="ch_filter" data-role="popup" class="ui-content messagePopup" data-overlay-theme="a" data-theme="a" style="max-width:' + popupWidth + 'px; min-width: ' + Math.floor(popupWidth * 0.6) + 'px;">' +

'<div data-role="header" data-theme="b">' +
    '<a href="javascript:;" data-role="button" data-icon="delete" data-iconpos="notext" class="ui-btn-right closePopup">Close</a>' +
    '<h1 class="adialog_title">' + stringres.get('menu_filter') + '</h1>' +
'</div>' +
'<div role="main" class="ui-content adialog_content_select" style="max-height: ' + popupHeight + 'px;">' +

//'<form id="settings_select_2">' +
'<fieldset id="ch_filter_select" data-role="controlgroup">' + radiogroup +
//    '<legend>Select transport layer protocol</legend>' +
//    '<input name="radio-choice-v-2" id="radio-choice-v-2a" value="on" checked="checked" type="radio">' +
//    '<label for="radio-choice-v-2a">One</label>' +
//    '<input name="radio-choice-v-2" id="radio-choice-v-2b" value="off" type="radio">' +
//    '<label for="radio-choice-v-2b">Two</label>' +

'</fieldset>' +
//'</form>' +

'</div>' +
'</div>';

    var popupafterclose = function () {};

    j$.mobile.activePage.append(template).trigger("create");
//--    j$.mobile.activePage.append(template).trigger("pagecreate");

    j$.mobile.activePage.find(".closePopup").bind("tap", function (e)
    {
        j$.mobile.activePage.find(".messagePopup").popup("close");
    });

    j$.mobile.activePage.find(".messagePopup").popup().popup("open").bind(
    {
        popupafterclose: function ()
        {
            j$(this).unbind("popupafterclose").remove();
//--                j$('#adialog_positive').off('click');
//--                j$('#adialog_negative').off('click');
            popupafterclose();
        }
    });

//-- listen for enter onclick, and click OK button
//-- !!NOT WORKING
//--       j$( "#settings_type_2" ).keypress(function( event )
//--    {
//--        if ( event.which === 13)
//--        {
//--            event.preventDefault();
//--            j$("#adialog_positive").click();
//--        }else
//--        {
//--            return;
//--        }
//--    });

    j$(":radio").on ("change", function (event)
    {
//--        alert (j$(this).attr ("id"));
//--        alert (j$(this).attr ("value"));

        ManuallyClosePopup(j$.mobile.activePage.find(".messagePopup"));
        j$.mobile.activePage.find(".messagePopup").popup("close");
        
        var valstr = j$(this).attr ("value");
        
        if (common.isNull(valstr) || valstr.length < 1 || common.IsNumber(valstr) === false)
        {
            common.PutToDebugLog(2, 'ERROR,_callhistorylist: Filter invalid value: ' + valstr);
            return;
        }
        var val = common.StrToInt(valstr);
        global.callhistoryfilter = val;
        PopulateList();
    });
    } catch(err) { common.PutToDebugLogException(2, "_callhistorylist: Filter", err); }
}

function ManuallyClosePopup(popupelement) // workaround for IE, sometimes popups are not closed simply by clicking the button, so we close it manually
{
    try{
    if (common.isNull(popupelement)) { return; }
    if (common.GetBrowser() === 'MSIE')
    {
        popupelement.popup("close");
    }
    else if (common.GetBrowser() === 'Firefox')
    {
        setTimeout(function ()
        {
            try{
            popupelement.popup("close"); // it will throw exception in may cases
            } catch(err) { ; }
        }, 200);
    }
    } catch(err) { common.PutToDebugLogException(2, "_callhistorylist: ManuallyClosePopup", err); }
}

function ClearCallhistory(popupafterclose)
{
    try{
    var popupWidth = common.GetDeviceWidth();
    if ( !common.isNull(popupWidth) && common.IsNumber(popupWidth) && popupWidth > 100 )
    {
        popupWidth = Math.floor(popupWidth / 1.2);
    }else
    {
        popupWidth = 220;
    }
    
    var template = '' +
'<div id="adialog_clearcallhistory" data-role="popup" class="ui-content messagePopup" data-overlay-theme="a" data-theme="a" style="max-width:' + popupWidth + 'px;">' +

    '<div data-role="header" data-theme="b">' +
        '<a href="javascript:;" data-role="button" data-icon="delete" data-iconpos="notext" class="ui-btn-right closePopup">Close</a>' +
        '<h1 class="adialog_title">' + stringres.get('clear_callhistory') + '</h1>' +
    '</div>' +
    '<div role="main" class="ui-content adialog_content adialog_alert">' +
        '<span> ' + stringres.get('clear_callhistory_msg') + ' </span>' +
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
    
//-- listen for enter onclick, and click OK button
//-- no need for this, because it reloads the page
//--    j$( "#adialog_clearcallhistory" ).keypress(function( event )
//--    {
//--        if ( event.which === 13 )
//--        {
//--            event.preventDefault();
//--            j$("#btn_adialog_ok").click();
//--        }else
//--        {
//--            return;
//--        }
//--    });

    
    j$('#btn_adialog_ok').on('click', function ()
    {
        global.chlist.splice(0, global.chlist.length);
        global.wasChModified = true;
        common.SaveCallhistoryFile(function (issaved)
        {
            common.PutToDebugLog(4, 'EVENT, _callhistorylist: ClearCallhistory SaveCallhistoryFile: ' + issaved.toString());
            PopulateList();
        });
    });
    } catch(err) { common.PutToDebugLogException(2, "_callhistorylist: ClearCallhistory", err); }
}

function onStop(event)
{
    try{
    common.PutToDebugLog(4, "EVENT, _callhistorylist: onStop");
    global.isCallhistorylistStarted = false;
    
    } catch(err) { common.PutToDebugLogException(2, "_callhistorylist: onStop", err); }
}

function onDestroy (event){} // deprecated by onstop
var callhistorylist_public = {

    MeasureCallhistorylist: MeasureCallhistorylist
};
window.callhistorylist_public = callhistorylist_public;

// public members and methods
return {
    onCreate: onCreate,
    onStart: onStart,
    onStop: onStop,
    onDestroy: onDestroy
};
})();