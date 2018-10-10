// Contact Details page
//--define(['jquery', 'common', 'stringres', 'global'], function($, common, stringres, global)
wpa._contactdetails = (function ()
{
var ctid = -1;
var contact = null;
var iscontact = false; // true if it's a saved contact in contacts list
var frompage = '';
var isfavorite = false; // is contact favorite

function onCreate (event) // called only once - bind events here
{
    try{
    common.PutToDebugLog(4, "EVENT, _contactdetails: onCreate");

    j$( window ).resize(function() // window resize handling
    {
        if (j$.mobile.activePage.attr('id') === 'page_contactdetails')
        {
            MeasureContactdetails();
        }
    });
    
    j$('#contactdetails_menu_ul').on('click', 'li', function(event)
    {
        MenuItemSelected(j$(this).attr('id'));
    });
    j$("#btn_contactdetails_menu").on("click", function() { CreateOptionsMenu('#contactdetails_menu_ul'); });
    j$("#btn_contactdetails_menu").attr("title", stringres.get("hint_menu"));
    
    } catch(err) { common.PutToDebugLogException(2, "_contactdetails: onCreate", err); }
}

function onStart(event)
{
    try{
    common.PutToDebugLog(4, "EVENT, _contactdetails: onStart");
    global.isContactdetailsStarted = true;
    
//--    document.getElementById("app_name_contactdetails").innerHTML = common.GetBrandName();
    j$(".separator_line_thick").css( 'background-color', common.HoverCalc(common.getBgColor('#page_contactdetails'), -30) );
    
    if (!common.isNull(document.getElementById('contactdetails_title')))
    {
        document.getElementById('contactdetails_title').innerHTML = stringres.get("ctdetails_title");
    }
    j$("#contactdetails_title").attr("title", stringres.get("hint_page"));

    if (!common.isNull(document.getElementById('ctdetails_btnback')))
    {
        document.getElementById('ctdetails_btnback').innerHTML = '<b>&LT;</b>&nbsp;' + stringres.get("ctdetails_btnback_txt");
    }
    
// needed for proper display of page height
    MeasureContactdetails();
    
    var modified = (common.GetTickCount()).toString();
    var ctname = common.GetIntentParam(global.intentctdetails, 'ctname');
    var ctnumber = common.GetIntentParam(global.intentctdetails, 'ctnumber');

    try { ctid = common.StrToInt( common.GetIntentParam(global.intentctdetails, 'ctid') ); } catch(err) { common.PutToDebugLogException(2, "_contactdetails: onStart can't convert ctid to INT", err); }
    
    if (ctid < 0 && !common.isNull(ctnumber) && ctnumber.length > 0)
    {
        ctid = common.GetContactIdFromNumber(ctnumber);
    }
    
    if (ctid >= 0)
    {
        iscontact = true;
        contact = global.ctlist[ctid];
    }
    
//--    PopulateData();
    
    if (ctid >= 0)
    {
        j$("#btn_contactdetails_favorite").show();
        isfavorite = common.ContactIsFavorite(ctid);
        if (isfavorite === true)
        {
            j$("#btn_contactdetails_favorite").attr('src', '' + common.GetElementSource() + 'images/btn_star_on_normal_holo_light.png').attr("title", stringres.get("menu_ct_unsetfavorite"));
        }else
        {
            j$("#btn_contactdetails_favorite").attr('src', '' + common.GetElementSource() + 'images/btn_star_off_normal_holo_light.png').attr("title", stringres.get("menu_ct_setfavorite"));
        }
    }else
    {
        iscontact = false;
        if (common.isNull(ctname)) { ctname = ''; }
        if (common.isNull(ctnumber)) { ctnumber = ''; }
        
        if (ctname.length > 0 && ctname === ctnumber)
        {
            ctname = common.GetContactNameFromNumber(ctnumber);
        }

        contact = [];
        contact[common.CT_NAME] = ctname;
        contact[common.CT_NUMBER] = [ctnumber];
        contact[common.CT_PTYPE] = ['other'];
        contact[common.CT_USAGE] = '0';
        contact[common.CT_LASTMODIF] = modified;
        contact[common.CT_DELFLAG] = '0';
        contact[common.CT_FAV] = '0';
        contact[common.CT_EMAIL] = '';
        contact[common.CT_ADDRESS] = '';
        contact[common.CT_NOTES] = '';
        contact[common.CT_WEBSITE] = '';
    }
    
    PopulateData();
    
    frompage = common.GetIntentParam(global.intentctdetails, 'frompage');
    
    if (frompage === 'dialpad' && !common.isNull(document.getElementById('ctdetails_btnback')))
    {
        document.getElementById('ctdetails_btnback').innerHTML = '<b>&LT;</b>&nbsp;' + stringres.get("go_back_btn_txt");
    }
    } catch(err) { common.PutToDebugLogException(2, "_contactdetails: onStart", err); }
}

function MeasureContactdetails() // resolve window height size change
{
    try{
//--    var pgh = common.GetDeviceHeight() - 1; j$('#page_contactdetails').css('min-height', pgh + 'px'); // must be set when softphone is skin in div
    j$('#page_contactdetails').css('min-height', 'auto'); // must be set when softphone is skin in div

    var heightTemp = common.GetDeviceHeight() - j$("#contactdetails_header").height();
    heightTemp = heightTemp - 3;
    j$("#page_contactdetails_content").height(heightTemp);
    
    } catch(err) { common.PutToDebugLogException(2, "_contactdetails: MeasureContactdetails", err); }
}

var isctblocked = false;
function PopulateData()
{
    var enablepres = false;
    var presencequery = [];
    try{
    if (common.isNull(contact) || contact.length < 1)
    {
        common.PutToDebugLog(2, 'ERROR, _contactdetails PopulateData contact is NULL');
        return;
    }
    
    j$("#page_contactdetails_content").html('');
    
    var content = '<div id="contact_name">' +
                        '<p>' + contact[common.CT_NAME] + '</p>' +
                        '<div id="contact_blocked">' +
                            '<img src="' + common.GetElementSource() + 'images/icon_block.png" id="contact_blocked_img" />' +
                        '</div>' +
                        '<div id="contact_favorite">' +
                            '<img id="btn_contactdetails_favorite" style="display: none;" src="' + common.GetElementSource() + 'images/btn_star_off_normal_holo_light.png" title="" />' +
                        '</div>' +
                    '</div>';
    
    var numbers = contact[common.CT_NUMBER];
    var types = contact[common.CT_PTYPE];
    
    if (common.UsePresence2() === true)
    {
        enablepres = true;
    }
    
    // check if contact is blocked
    if (!common.isNull(numbers) && numbers.length > 0)
    {
        if (common.IsContactBlocked(null, numbers)) { isctblocked = true; }
    }
    
    var NOW = common.GetTickCount();
    if (!common.isNull(numbers) && numbers.length > 0)
    {
        for (var i = 0; i < numbers.length; i++)
        {
            var presenceimg = ''; //<img src="images/presence_available.png" />

            if (enablepres)
            {
                var presence = '-1';
                var lastcheck = 0; // timestamp last checked presence
                var presobj = global.presenceHM[numbers[i]];
                if (!common.isNull(presobj))
                {
                    presence = presobj[common.PRES_STATUS];
                    var laststr = presobj[common.PRES_TIME];
                    if (!common.isNull(laststr) && common.IsNumber(laststr))
                    lastcheck = common.StrToInt(laststr);
                }

                // -1=not exists(undefined), 0=offline, 1=invisible, 2=idle, 3=pending, 4=DND, 5=online
                
                if (common.isNull(presence) || presence.length < 1 || presence === '-1'/* || (lastcheck > 0 && NOW - lastcheck > 20000)*/)
                {
                    presenceimg = '';
                    
                    if (common.isNull(presencequery)) { presencequery = []; }
                    if (presencequery.indexOf(numbers[i]) < 0)
                    {
                        presencequery.push(numbers[i]);
                    }
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
            }
            
//--             don't display "Call other", just "Call"
            var type = stringres.get('type_' + types[i]);
            if (numbers.length < 2) { type = common.Trim(type.substring(0, type.indexOf(' '))); }
            
            var itemcall = 
                '<div id="ct_entry_' + i + '" class="cd_container">' +
                    '<div id="cd_call_' + i + '" class="cd_call">' +
                        '<div class="cd_data">' +
                            '<div class="cd_type">' + type + '</div>' +
                            '<div class="cd_number">' + numbers[i] + '</div>' +
                        '</div>' +
                        '<div class="cd_icon">' +
                            presenceimg + '<img src="' + common.GetElementSource() + 'images/icon_call.png" />' +
                        '</div>' +
                    '</div>' +
                '</div>';
        
            var itemmsg = 
                '<div id="ct_entry_' + i + '" class="cd_container">' +
                    '<div id="cd_msg_' + i + '" class="cd_call">' +
                        '<div class="cd_data">' +
                            '<div class="cd_type">' + stringres.get('send_msg') + '</div>' +
                            '<div class="cd_number">' + numbers[i] + '</div>' +
                        '</div>' +
                        '<div class="cd_icon">' +
                            presenceimg + '<img src="' + common.GetElementSource() + 'images/icon_message.png" />' +
                        '</div>' +
                    '</div>' +
                '</div>';
        
            var itemvideo = '';
            if (common.CanIUseVideo() === true)
            {
                itemvideo = 
                '<div id="ct_entry_' + i + '" class="cd_container">' +
                    '<div id="cd_video_' + i + '" class="cd_call">' +
                        '<div class="cd_data">' +
                            '<div class="cd_type">' + stringres.get('video_call') + '</div>' +
                            '<div class="cd_number">' + numbers[i] + '</div>' +
                        '</div>' +
                        '<div class="cd_icon">' +
                            presenceimg + '<img src="' + common.GetElementSource() + 'images/btn_video_txt.png" />' +
                        '</div>' +
                    '</div>' +
                '</div>';
            }


// handle hidesettings
            if (common.HideSettings('chat', stringres.get('sett_display_name_' + 'chat'), 'chat', true) === true)
            {
                itemmsg = '';
            }

            content = content + itemcall + itemmsg + itemvideo;
        }
    }
    
    var backtitle = '';
    if (frompage === 'dialpad')
    {
        backtitle = stringres.get('btn_close');
    }else
    {
        backtitle = stringres.get('ctdetails_btnback_txt');
    }

    var controls = '';
    
    if (common.CanIUseScreensharing() === true)
    {
        controls = controls +
        '<div id="ct_screensh" class="cd_container">' +
            '<div id="ct_screensh_entry_button" class="cd_call">' +
                '<div class="cd_button">' + stringres.get('menu_screenshare') + '</div>' +
            '</div>' +
        '</div>';
    }
    
    if (common.GetConfigBool('hasfiletransfer', true) !== false && (common.GetConfigBool('usingmizuserver', false) === true || common.IsMizuWebRTCGateway() === true))
    {
        if (common.Glft() === true)
        {
            controls = controls +
            '<div id="ct_filetransf" class="cd_container">' +
                '<div id="ct_filetransf_entry_button" class="cd_call">' +
                    '<div class="cd_button">' + stringres.get('filetransf_title') + '</div>' +
                '</div>' +
            '</div>';
        }
    }
    
    if (iscontact)
    {
        controls = controls +
            '<div id="ct_edit_entry" class="cd_container">' +
                '<div id="ct_edit_entry_button" class="cd_call">' +
                    '<div class="cd_button">' + stringres.get('menu_editcontact') + '</div>' +
                '</div>' +
            '</div>' +
            '<div id="ct_delete_entry" class="cd_container">' +
                '<div id="ct_delete_entry_button" class="cd_call">' +
                    '<div class="cd_button">' + stringres.get('menu_deletecontact') + '</div>' +
                '</div>' +
            '</div>';
    }else
    {
        controls = controls +
        '<div id="ct_save_entry" class="cd_container">' +
            '<div id="ct_save_entry_button" class="cd_call">' +
                '<div class="cd_button">' + stringres.get('menu_createcontact') + '</div>' +
            '</div>' +
        '</div>';
    }
    
    controls = controls +
        '<div id="ct_allcontacts_entry" class="cd_container">' +
            '<div id="ct_allcontacts_entry_button" class="cd_call">' +
                '<div class="cd_button">' + backtitle + '</div>' +
            '</div>' +
        '</div>';

    content = content + controls;

    j$("#page_contactdetails_content").html(content);
    
    if (isctblocked === true)
    {
        j$('#contact_blocked_img').show();
    }

// add event listeners
    if (!common.isNull(numbers) && numbers.length > 0)
    {
        for (var i = 0; i < numbers.length; i++)
        {
            (function (i)
            {
                j$('#cd_call_' + i).on('click', function() { OnItemClick(i, 0); });
                j$('#cd_msg_' + i).on('click', function() { OnItemClick(i, 1); });
                j$('#cd_video_' + i).on('click', function() { OnItemClick(i, 2); });
            }(i));
        }
    }
    j$('#ct_screensh_entry_button').on('click', function() { ScreenSh(); });
    j$('#ct_filetransf_entry_button').on('click', function() { FileTrasnf(); });
    j$('#ct_edit_entry_button').on('click', function() { EditContact(); });
    j$('#ct_delete_entry_button').on('click', function() { DeleteContactPopup(); });
    j$('#ct_save_entry_button').on('click', function() { SaveContact(); });
    j$('#ct_allcontacts_entry_button').on('click', function() { j$.mobile.back(); });
    
    
// handle favorite
    j$("#btn_contactdetails_favorite").off("click");
    j$("#btn_contactdetails_favorite").on("click", function()
    {
        ToggleFavorite();
    });
    
    if (ctid >= 0) // means it's a contact, not JUST A NUMBER
    {
        j$("#btn_contactdetails_favorite").show();
        isfavorite = common.ContactIsFavorite(ctid);
        if (isfavorite === true)
        {
            j$("#btn_contactdetails_favorite").attr('src', '' + common.GetElementSource() + 'images/btn_star_on_normal_holo_light.png').attr("title", stringres.get("menu_ct_unsetfavorite"));
        }else
        {
            j$("#btn_contactdetails_favorite").attr('src', '' + common.GetElementSource() + 'images/btn_star_off_normal_holo_light.png').attr("title", stringres.get("menu_ct_setfavorite"));
        }
    }
// END handle favorite
    
    if (enablepres && !common.isNull(presencequery) && presencequery.length > 0)
    {
        var ulist = '';
        for (var i = 0; i < presencequery.length; i++)
        {
            if (common.isNull(presencequery[i]) || common.Trim(presencequery[i]).length < 1) { continue; }
            
            if (ulist.length > 0) { ulist = ulist + ','; }
            ulist = ulist + presencequery[i];
        }
        
        if (!common.isNull(ulist) && ulist.length > 0)
        {
            ulist = common.ReplaceAll(ulist, '-', '');
            ulist = common.ReplaceAll(ulist, ')', '');
            ulist = common.ReplaceAll(ulist, '(', '');
            
            common.PresenceGet2(ulist);
        }
    }
    } catch(err) { common.PutToDebugLogException(2, "_contactdetails: PopulateData", err); }
}

function ScreenSh() // opens page message with the contact's number
{
    try{
    common.PutToDebugLog(2, 'EVENT, _contactdetails: ScreenSh');
    var numbers = contact[common.CT_NUMBER];
    
    if (common.isNull(numbers) || numbers.length < 1)
    {
        common.PutToDebugLog(1, 'ERROR,' + stringres.get('ct_menu_error'));
        common.ShowToast('ERROR,' + stringres.get('ct_menu_error'));
        return;
    }
    
    if (numbers.length === 1)
    {
        webphone_api.screenshare(numbers[0]);
        return;
    }else
    {
        common.PickContactNumber(ctid, function(pick_nr, pick_name)
        {
            webphone_api.screenshare(pick_nr);
        });
        return;
    }
    } catch(err) { common.PutToDebugLogException(2, "_contactdetails: ScreenSh", err); }
}

function FileTrasnf() // opens page message with the contact's number
{
    try{
    common.PutToDebugLog(2, 'EVENT, _contactdetails: FileTrasnf');
    var numbers = contact[common.CT_NUMBER];
    
    if (common.isNull(numbers) || numbers.length < 1)
    {
        common.PutToDebugLog(1, 'ERROR,' + stringres.get('ct_menu_error'));
        common.ShowToast('ERROR,' + stringres.get('ct_menu_error'));
        return;
    }
    
    if (numbers.length === 1)
    {
        common.FileTransfer(numbers[0]);
        return;
    }else
    {
        common.PickContactNumber(ctid, function(pick_nr, pick_name)
        {
            common.FileTransfer(pick_nr);
        });
        return;
    }
    } catch(err) { common.PutToDebugLogException(2, "_contactdetails: FileTrasnf", err); }
}

function ToggleFavorite()
{
    try{
    if (isfavorite === true)
    {
        j$("#btn_contactdetails_favorite").attr('src', '' + common.GetElementSource() + 'images/btn_star_off_normal_holo_light.png').attr("title", stringres.get("menu_ct_setfavorite"));
        common.ContactSetFavorite(ctid, false);
    }else
    {
        j$("#btn_contactdetails_favorite").attr('src', '' + common.GetElementSource() + 'images/btn_star_on_normal_holo_light.png').attr("title", stringres.get("menu_ct_unsetfavorite"));
        common.ContactSetFavorite(ctid, true);
    }
    isfavorite = !isfavorite;

    } catch(err) { common.PutToDebugLogException(2, "_contactdetails: ToggleFavorite", err); }
}
    
var trigerred = false; // handle multiple clicks
function OnItemClick(contactid, type) // type: 0=call, 1=chat, 2=video call
{
    try{
    if (trigerred) { return; }
    
    trigerred = true;
    setTimeout(function ()
    {
        trigerred = false;
    }, 1000);

    if (common.isNull(contactid)) { return; }
    
    var numbers = contact[common.CT_NUMBER];
    var to = numbers[contactid];
    var name = contact[common.CT_NAME];
    
    if (type === 0)
    {
        common.PutToDebugLog(4, 'EVENT, _contactdetails initiate call to: ' + to);
        
        setTimeout(function () //-- timeout, so j$.mobile.back(); won't close call page
        {
            webphone_api.call(to, -1);
        }, 100);
        
        if (common.getuseengine() === 'p2p')
        {
            return;
        }
        j$.mobile.back();

//--        setTimeout(function ()
//--        {
//--            j$.mobile.changePage("#page_call", { transition: "pop", role: "page" });
//--        }, 20);

//--        j$.mobile.changePage("#page_call", { transition: "pop", role: "page" });
    }
    else if (type === 1)
    {
        common.StartMsg(to, '', '_contactdetails');
    }
    else if (type === 2)
    {
        common.PutToDebugLog(4, 'EVENT, _contactdetails initiate video call to: ' + to);
        webphone_api.videocall(to);
    }
    } catch(err) { common.PutToDebugLogException(2, "_contactdetails: OnItemClick", err); }
}

var MENUITEM_CONTACTDETAILS_EDIT = '#menuitem_contactdetails_edit';
var MENUITEM_CONTACTDETAILS_DELETE = '#menuitem_contactdetails_delete';
var MENUITEM_CONTACTDETAILS_CREATE = '#menuitem_contactdetails_create';
var MENUITEM_CONTACTDETAILS_BLOCKCT = '#menuitem_contactdetails_blockct';
var MENUITEM_CONTACTDETAILS_FAVORITE = '#menuitem_contactdetails_favorite';

function CreateOptionsMenu (menuId) // adding items to menu, called from html
{
    try{
// remove data transition for windows softphone, because it's slow
    if (common.IsWindowsSoftphone())
    {
        j$( "#btn_contactdetails_menu" ).removeAttr('data-transition');
    }

    if ( common.isNull(menuId) || menuId.lenght < 1 ) { common.PutToDebugLog(2, "ERROR, _contactdetails: CreateOptionsMenu menuid null"); return; }

    if (j$(menuId).length <= 0) { common.PutToDebugLog(2, "ERROR, _contactdetails: CreateOptionsMenu can't get reference to Menu"); return; }
    
    if (menuId.charAt(0) !== '#') { menuId = '#' + menuId; }

    j$(menuId).html('');
    
    if (iscontact)
    {
        j$(menuId).append( '<li id="' + MENUITEM_CONTACTDETAILS_EDIT + '"><a data-rel="back">' + stringres.get('menu_editcontact') + '</a></li>' ).listview('refresh');
    
        j$(menuId).append( '<li id="' + MENUITEM_CONTACTDETAILS_DELETE + '"><a data-rel="back">' + stringres.get('menu_deletecontact') + '</a></li>' ).listview('refresh');
    }else
    {
        j$(menuId).append( '<li id="' + MENUITEM_CONTACTDETAILS_CREATE + '"><a data-rel="back">' + stringres.get('menu_createcontact') + '</a></li>' ).listview('refresh');
    }
    
    var blocktitle = stringres.get('menu_block_contact');
    if (isctblocked === true) { blocktitle = stringres.get('menu_unblock_contact'); }
    	
    j$(menuId).append( '<li id="' + MENUITEM_CONTACTDETAILS_BLOCKCT + '"><a data-rel="back">' + blocktitle + '</a></li>' ).listview('refresh');

    var favtitle = stringres.get('menu_ct_setfavorite');
    if (isfavorite === true) { favtitle = stringres.get('menu_ct_unsetfavorite'); }
    	
    j$(menuId).append( '<li id="' + MENUITEM_CONTACTDETAILS_FAVORITE + '"><a data-rel="back">' + favtitle + '</a></li>' ).listview('refresh');

    return true;
    
    } catch(err) { common.PutToDebugLogException(2, "_contactdetails: CreateOptionsMenu", err); }
    
    return false;
}

function MenuItemSelected(itemid)
{
    try{
    if (common.isNull(itemid) || itemid.length < 1) { return; }
    
    j$( '#contactdetails_menu' ).on( 'popupafterclose', function( event )
    {
        j$( '#contactdetails_menu' ).off( 'popupafterclose' );
        
        switch (itemid)
        {
            case MENUITEM_CONTACTDETAILS_EDIT:
                EditContact();
                break;
            case MENUITEM_CONTACTDETAILS_DELETE:
                DeleteContactPopup();
                break;
            case MENUITEM_CONTACTDETAILS_CREATE:
                SaveContact();
                break;
            case MENUITEM_CONTACTDETAILS_BLOCKCT:
                ToggleCtBlocked();
                break;
            case MENUITEM_CONTACTDETAILS_FAVORITE:
                ToggleFavorite();
                break;
        }
    });
    } catch(err) { common.PutToDebugLogException(2, "_contactdetails: MenuItemSelected", err); }
}

function ToggleCtBlocked()
{
    try{
    if (isctblocked === true)
    {
        isctblocked = false;
        j$('#contact_blocked_img').hide();

        var numbers = contact[common.CT_NUMBER];
        if (!common.isNull(numbers) && numbers.length > 0)
        {
            common.UnBlockContact(null, numbers);
        }
    }else
    {
        isctblocked = true;
        j$('#contact_blocked_img').show();

        var numbers = contact[common.CT_NUMBER];
        if (!common.isNull(numbers) && numbers.length > 0)
        {
            common.BlockContact(null, numbers);
        }
    }
    } catch(err) { common.PutToDebugLogException(2, "_contactdetails: ToggleCtBlocked", err); }
}

function SaveContact()
{
    try{
    global.intentaddeditct[0] = 'action=add';
    global.intentaddeditct[1] = 'numbertoadd=' + contact[common.CT_NUMBER][0];
    var name = contact[common.CT_NAME];
    if (common.isNull(name) || name.length < 1 || name === contact[common.CT_NUMBER][0]) { name = ''; }
    global.intentaddeditct[2] = 'nametoadd=' + name;
    
    j$.mobile.changePage("#page_addeditcontact", { transition: "pop", role: "page" });
    
    } catch(err) { common.PutToDebugLogException(2, "_contactdetails: CreateContact", err); }
}

function EditContact() // open AddEditContact activity
{
    try{
    global.intentaddeditct[0] = 'action=edit';
    global.intentaddeditct[1] = 'ctid=' + ctid;
    
    j$.mobile.changePage("#page_addeditcontact", { transition: "pop", role: "page" });

    } catch(err) { common.PutToDebugLogException(2, "_contactdetails: EditContact", err); }
}

function DeleteContactPopup(popupafterclose)
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
'<div id="delete_contact_popup" data-role="popup" class="ui-content messagePopup" data-overlay-theme="a" data-theme="a" style="max-width:' + popupWidth + 'px;">' +

    '<div data-role="header" data-theme="b">' +
        '<a href="javascript:;" data-role="button" data-icon="delete" data-iconpos="notext" class="ui-btn-right closePopup">Close</a>' +
        '<h1 class="adialog_title">' + stringres.get('menu_deletecontact') + '</h1>' +
    '</div>' +
    '<div role="main" class="ui-content adialog_content adialog_alert">' +
        '<span> ' + stringres.get('contact_delete_msg') + ' </span>' +
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
        DeleteContact();
    });
    
//--    global.ctlist.splice(ctid, 1);
//--    common.SaveContactsFile(function (issaved) { common.PutToDebugLog(4, 'EVENT, _contactdetails: DeleteContact SaveContactsFile: ' + issaved.toString()); });
    
//--    j$.mobile.back();
        
    } catch(err) { common.PutToDebugLogException(2, "_contactdetails: DeleteContactPopup", err); }
}

function DeleteContact()
{
    try{
    j$( '#delete_contact_popup' ).on( 'popupafterclose', function( event )
    {
        j$( '#delete_contact_popup' ).off( 'popupafterclose' );

        global.ctlist.splice(ctid, 1);
        common.SaveContactsFile(function (issaved) { common.PutToDebugLog(4, 'EVENT, _contactdetails: DeleteContact SaveContactsFile: ' + issaved.toString()); });

        j$.mobile.back();
    });
    } catch(err) { common.PutToDebugLogException(2, "_contactdetails: DeleteContact", err); }
}

function onStop(event)
{

    try{
    common.PutToDebugLog(4, "EVENT, _contactdetails: onStop");
    global.isContactdetailsStarted = false;
    
    j$('#contact_blocked_img').hide();
    isctblocked = false;
    
    j$("#page_contactdetails_content").html('');
    j$("#btn_contactdetails_favorite").off("click");
    
    ctid = -1;
    contact = null;
    iscontact = false;
    frompage = '';
    isfavorite = false;
    
    } catch(err) { common.PutToDebugLogException(2, "_contactdetails: onStop", err); }
}

function onDestroy (event){} // deprecated by onstop

var contactdetails_public = {

    PopulateData: PopulateData
};
window.contactdetails_public = contactdetails_public;

// public members and methods
return {
    onCreate: onCreate,
    onStart: onStart,
    onStop: onStop,
    onDestroy: onDestroy,
    PopulateData: PopulateData
};
})();