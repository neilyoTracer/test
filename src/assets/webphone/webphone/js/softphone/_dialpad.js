/* global common, stringres, j$ */

// Dialpad page
//--define(['jquery', 'common', 'stringres', 'global', 'file'], function($, common, stringres, global, file)
wpa._dialpad = (function ()
{

var chooseenginetouse = '';
var btn_isvoicemail = false; // if true, then dialpad button (in bottom-left corner) is handled as voicemail
var showfulldialpad = true; // if there are recents, then when searching and we have no results, don't show full dialpad

function onCreate (event) // called only once - bind events here
{
    try{
    common.PutToDebugLog(4, "EVENT, _dialpad: onCreate");
    
// navigation done with js, so target URL will not be displayed in browser statusbar
    j$("#nav_dp_contacts").on("click", function()
    {
        j$.mobile.changePage("#page_contactslist", { transition: "none", role: "page" });
    });
    j$("#nav_dp_callhistory").on("click", function()
    {
        j$.mobile.changePage("#page_callhistorylist", { transition: "none", role: "page" });
    });
    
    j$("#nav_dp_dialpad").attr("title", stringres.get("hint_dialpad"));
    j$("#nav_dp_contacts").attr("title", stringres.get("hint_contacts"));
    j$("#nav_dp_callhistory").attr("title", stringres.get("hint_callhistory"));
    
    j$("#status_dialpad").attr("title", stringres.get("hint_status"));
    j$("#curr_user_dialpad").attr("title", stringres.get("hint_curr_user"));
    j$(".img_encrypt").attr("title", stringres.get("hint_encicon"));
    j$("#dialpad_not_btn").on("click", function()
    {
        common.SaveParameter('notification_count2', 0);
        common.ShowNotifications2(); // repopulate notifications (hide red dot number)
    });
    
    j$("#phone_number").attr("title", stringres.get("hint_phone_number"));
    
    j$("#phone_number").on('input', function() // input text on change listener
    {
        PhoneInputOnChange();
    });

    j$("#btn_showhide_numpad").on("click", function()
    {
        try{
        if (btn_isvoicemail)
        {
            MenuVoicemail();
        }else
        {
            if (j$('#dialpad_btn_grid').css('display') === 'none')
            {
                j$('#dialpad_btn_grid').show();
            }else
            {
                j$('#dialpad_btn_grid').hide();
            }

            MeasureDialPad();
        }
        
        } catch(err2) { common.PutToDebugLogException(2, "_dialpad: btn_showhide_numpad on click", err2); }
    });
    j$("#btn_showhide_numpad").attr("title", stringres.get("hint_numpad"));
    
    j$('#dialpad_list').on('click', '.ch_anchor', function(event)
    {
        OnListItemClick(j$(this).attr('id'));
    });

    j$('#dialpad_list').on('taphold', '.ch_anchor', function(event) // also show context menu
    {
        var id = j$(this).attr('id');
        if (!common.isNull(id))
        {
            id = id.replace('recentitem_', 'recentmenu_');
            OnListItemClick(id, true);
        }
    });

    j$('#dialpad_list').on('click', '.ch_menu', function(event)
    {
        OnListItemClick(j$(this).attr('id'));
    });

    
    j$("#btn_voicemail").on("click", function()
    {
        try{
        if (common.GetParameterInt('voicemail', 2) !== 2)
        {
            QuickCall();
        }else
        {
            var vmNumber = common.GetParameter("voicemailnum");

            if (!common.isNull(vmNumber) && vmNumber.length > 0)
            {
                StartCall(vmNumber);
            }else
            {
                SetVoiceMailNumber(function (vmnr)
                {
                    if (!common.isNull(vmnr) && vmnr.length > 0) { StartCall(vmnr); }
                });
            }
        }
        } catch(err2) { common.PutToDebugLogException(2, "_dialpad: btn_voicemail on click", err2); }
    });
    j$("#btn_voicemail").attr("title", stringres.get("hint_voicemail"));
    
    var trigerred = false; // handle multiple clicks
    j$("#btn_call").on("click", function()
    {
        common.PutToDebugLog(4, 'EVENT, dialpad call button clicked');
        if (trigerred) { return; }
    
        trigerred = true;
        setTimeout(function ()
        {
            trigerred = false;
        }, 1000);
    
//--         tunnel should not allow call without server address set (direct call to sip uri)
        if (common.GetParameter('serverinputisupperserver') === 'true')
        {
            if (common.isNull(common.GetParameter('sipusername')) || common.GetParameter('sipusername').length <= 0 ||
                    common.isNull(common.GetParameter('password')) || common.GetParameter('password').length <= 0 )
//--                || common.isNull(common.GetParameter('upperserver')) || common.GetParameter('upperserver').length <= 0)
            {
                return;
            }
        }
 
        var field = document.getElementById('phone_number');
        if ( common.isNull(field) ) { return; }
        
        var phoneNumber = field.value;
        var lastDialed = common.GetParameter("redial");

        if (common.isNull(phoneNumber) || phoneNumber.length < 1)
        {
            if (!common.isNull(lastDialed) && lastDialed.length > 0)
            {
                field.value = lastDialed;
            }else
            {
                common.PutToDebugLog(1, stringres.get('err_msg_3'));
                return;
            }
        }else
        {
            phoneNumber = common.Trim(phoneNumber);
            StartCall(phoneNumber);
            common.SaveParameter("redial", phoneNumber);
            j$('#disprate_container').html('&nbsp;');
        }
    });
    
    j$("#btn_call").attr("title", stringres.get("hint_btn_call"));

    // listen for enter onclick, and click Call button
    j$( "#page_dialpad" ).keypress(function( event )
    {        
        HandleKeyPress(event);
    });

    // listen for control key, so we don't catch ctrl+c, ctrl+v
    j$( "#page_dialpad" ).keydown(function(event)
    {
        try{
        var charCode = (event.keyCode) ? event.keyCode : event.which; // workaround for firefox
        
        if (charCode == ctrlKey) { ctrlDown = true; return true; }
        if (charCode == altKey) { altDown = true; return true; }
        if (charCode == shiftKey) { shiftDown = true; return true; }
        if (event.ctrlKey || event.metaKey || event.altKey) { specialKeyDown = true; return true; }

        if ( charCode === 8) // backspace
        {
//--            event.preventDefault();
            if (j$('#phone_number').is(':focus') === false)
            {
                BackSpaceClick();
            }
        }
        else if ( charCode === 13)
        {
//--            event.preventDefault();
            if (j$(".ui-page-active .ui-popup-active").length > 0)
            {
                var pop = j$.mobile.activePage.find(".messagePopup")
                if (!common.isNull(pop) && (pop.attr("id") === 'adialog_videocall' || pop.attr("id") === 'adialog_screensharecall')) // initiate video call
                {
                    j$('#adialog_positive').click();
                }
                return false;
            }
            j$("#btn_call").click();
        }
        } catch(err) { common.PutToDebugLogException(2, "_dialpad: keydown", err); }

    })//--.keyup(function(event)
//--    {
//--        try{
//--        var charCode = (event.keyCode) ? event.keyCode : event.which; // workaround for firefox

//--        if (charCode == ctrlKey) { ctrlDown = false; }
//--        if (charCode == altKey) { altDown = false; }
//--        if (charCode == shiftKey) { shiftDown = false; }
//--        if (event.ctrlKey || event.metaKey || event.altKey) { specialKeyDown = false; }
        
//--        return false;
//--        } catch(err) { common.PutToDebugLogException(2, "_dialpad: keyup", err); }
//--    });

    j$("#btn_message").on("click", function()
    {
//--        if (common.GetConfigInt('brandid', -1) === 60) // 101VOICEDT500
//--        {
//--            MenuVoicemail();
//--        }else
//--        {
            MsgOnClick();
//--        }
    });
    j$("#btn_message").attr("title", stringres.get("hint_message"));
    
//--    if (common.GetConfigInt('brandid', -1) === 60) // 101VOICEDT500
//--    {
//--        j$("#btn_message_img").attr("src", '' + common.GetElementSource() + 'images/btn_voicemail_txt_big.png');
//--        j$("#btn_message").attr("title", stringres.get("hint_voicemail"));
//--    }
//--     !!! DEPRECATED
//--    j$("#dialpad_notification").on("click", function()
//--    {
//--        common.NotificationOnClick();
//--    });

    j$('#dialpad_notification_list').on('click', '.nt_anchor', function(event)
    {
        j$("#dialpad_not").panel( "close" );
        common.NotificationOnClick2(j$(this).attr('id'), false);
    });
    j$('#dialpad_notification_list').on('click', '.nt_menu', function(event)
    {
        j$("#dialpad_not").panel( "close" );
        common.NotificationOnClick2(j$(this).attr('id'), true);
    });
    
    j$( window ).resize(function() // window resize handling
    {
        if (j$.mobile.activePage.attr('id') === 'page_dialpad')
        {
            MeasureDialPad();
        }
    });
    
    j$('#dialpad_menu_ul').on('click', 'li', function(event)
    {
        MenuItemSelected(j$(this).attr('id'));
    });
    j$("#btn_dialpad_menu").on("click", function() { CreateOptionsMenu('#dialpad_menu_ul'); });
    j$("#btn_dialpad_menu").attr("title", stringres.get("hint_menu"));
    
    setTimeout(function ()
    {
        var displaypopup = false;
        if (common.GetParameterBool('customizedversion', true) !== true && common.GetParameter('displaypopupdirectcalls') === 'true')
        {
//--         in this case we have to watch 'upperserver', NOT 'serveraddress_user'
//--            if (common.GetParameter('serverinputisupperserver') === 'true')
//--            {
                if ( common.isNull(common.GetParameter('sipusername')) || common.GetParameter('sipusername').length <= 0
                    || common.isNull(common.GetParameter('password')) || common.GetParameter('password').length <= 0 )
                {
                    displaypopup = true;
                }
//--            }else
//--            {
//--                if ((common.isNull(common.GetParameter('sipusername')) || common.GetParameter('sipusername').length <= 0
//--                    || common.isNull(common.GetParameter('password')) || common.GetParameter('password').length <= 0))
//--                {
//--                    if ((common.isNull(common.GetParameter('serveraddress_user')) || common.GetParameter('serveraddress_user').length <= 0)
//--                            && (common.isNull(common.GetParameter('serveraddress_orig')) || common.GetParameter('serveraddress_orig').length <= 0)
//--                            && (common.isNull(common.GetParameter('serveraddress')) || common.GetParameter('serveraddress').length <= 0))
//--                    {
//--                        displaypopup = true;
//--                    }
//--                }
//--            }
        }
        
        if (displaypopup)
        {
            common.SaveParameter('displaypopupdirectcalls', 'false');
//--            common.AlertDialog(stringres.get('warning'), stringres.get('warning_msg_1'));
            common.ShowToast(stringres.get('warning_msg_1'), 6000);
        }
    },3000);
    
    j$("#btn_dp_1").on("tap", function()
    {
        PutNumber('1');
        
//--        if (global.isdebugversionakos)
//--        {
//--            common.UriParser(common.GetParameter('creditrequest'), '', '', '', '', 'creditrequest');
            
//--            var balanceuri = 'http://88.150.183.87:80/mvapireq/?apientry=balance&authkey=1568108345&authid=9999&authmd5=760e4155f1f1c8e614664e20fff73290&authsalt=123456&now=415';
//--            common.UriParser(balanceuri, '', '', '', '', 'creditrequest');
//--        }
        
    });
    j$("#btn_dp_2").on("tap", function()
    {
        PutNumber('2');
    });
    j$("#btn_dp_3").on("tap", function()
    {
        PutNumber('3');
    });
    j$("#btn_dp_4").on("tap", function()
    {
        PutNumber('4');
    });
    j$("#btn_dp_5").on("tap", function()
    {
        PutNumber('5');
    });
    j$("#btn_dp_6").on("tap", function()
    {
        PutNumber('6');
    });
    j$("#btn_dp_7").on("tap", function()
    {
        PutNumber('7');
    });
    j$("#btn_dp_8").on("tap", function()
    {
        PutNumber('8');
    });
    j$("#btn_dp_9").on("tap", function()
    {
        PutNumber('9');
    });
    j$("#btn_dp_0").on("tap", function(evt)
    {
        PutNumber('0');
    });
    j$("#btn_dp_ast").on("tap", function()
    {
        PutNumber('*');
    });
    j$("#btn_dp_diez").on("tap", function()
    {
        PutNumber('#');
    });
    
// long cliks
    j$("#btn_dp_0").on("taphold", function(evt)
    {
        PutCharLongpress(['+']);
    });

    
    j$("#btn_backspace").on("click", function()
    {
        BackSpaceClick();
    });
    
    j$("#btn_backspace").on("taphold", function()
    {
        if (!common.isNull( document.getElementById('phone_number') ))
        {
            document.getElementById('phone_number').value = '';
        }
        
        PhoneInputOnChange();
    });
    if (common.GetColortheme() === 11)
    {
        j$("#btn_backspace_img").attr("src","' + common.GetElementSource() + 'images/btn_backspace_txt_grey.png");
    }
    
    
    setTimeout(function ()
    {
        common.GetContacts(function (success)
        {
            if (!success)
            {
                common.PutToDebugLog(2, 'EVENT, _dialpad: LoadContacts failed onCreate');
            }
        });
    }, 500);
    
    setTimeout(function ()
    {
        common.ReadCallhistoryFile(function (success)
        {
            if (!success)
            {
                common.PutToDebugLog(2, 'EVENT, _dialpad: load call history failed onCreate');
            }
        });
    }, 1000);
    
    var advuri = common.GetParameter('advertisement');
    if (!common.isNull(advuri) && advuri.length > 5)
    {
        j$('#advert_dialpad_frame').attr('src', advuri);
        j$('#advert_dialpad').show();
    }
    
    if (common.UsePresence2() === true)
    {
        j$("#dialpad_additional_header_left").on("click", function()
        {
            common.PresenceSelector('dialpad');
        });
        j$("#dialpad_additional_header_left").css("cursor", "pointer");
    }

// showratewhiletype = 0; // show rating on dialpad page, while typing the destination number  // 0=no, 1=yes
    var srateStr = common.GetConfig('showratewhiletype');
    if (common.isNull(srateStr) || srateStr.length < 1 || !common.IsNumber(srateStr)) { srateStr = common.GetParameter2('showratewhiletype'); }
    if (common.isNull(srateStr) || srateStr.length < 1 || !common.IsNumber(srateStr)) { srateStr = '0'; }
    global.showratewhiletype_cache = common.StrToInt(srateStr);
    
    if (global.showratewhiletype_cache > 0 && !common.isNull(document.getElementById("disprate_container")) && common.GetParameter('ratingrequest').length > 0)
    {
        document.getElementById("disprate_container").style.display = 'block';
    }

    
//--     in IE8 under WinXP aterisk is not displayed properly
//--    if (common.IsIeVersion(8))
//--    {
//--        j$("#dialpad_asterisk").html("*");
//--    }
    
    j$("#btn_dialpad_engine_close").on("click", function(event)
    {
        common.SaveParameter('ignoreengineselect', 'true');

        j$('#settings_engine').hide();
        j$('#dialpad_engine').hide();
        
        MeasureDialPad();
    });
    
    j$("#btn_dialpad_engine").on("click", function(event)
    {
        common.SaveParameter('ignoreengineselect', 'true');

        j$('#settings_engine').hide();
        j$('#dialpad_engine').hide();
        
        if (common.isNull(chooseenginetouse) || chooseenginetouse.length < 1) { return; }
        MeasureDialPad();
        
// handle click action based on selected engine
        if (chooseenginetouse === 'java'){ ; }
        else if (chooseenginetouse === 'webrtc') { common.EngineSelect(1); }
        else if (chooseenginetouse === 'ns') { common.NPDownloadAndInstall(); }
        else if (chooseenginetouse === 'flash')
        {
            ; // akos todo: implement for flash
        }
        else if (chooseenginetouse === 'app')
        {
            ;
        }

// save clicked engine
        var engine = common.GetEngine(chooseenginetouse);
        if (!common.isNull(engine))
        {
            engine.clicked = 2;
            common.SetEngine(chooseenginetouse, engine);
            
            common.OpenSettings(true);
            
            // wait for settings to launch
            setTimeout(function ()
            {
                common.ShowToast(common.GetEngineDisplayName(chooseenginetouse) + ' ' + stringres.get('ce_use'), function ()
                {
                    common.ChooseEngineLogic2(chooseenginetouse);
                    chooseenginetouse = '';
                });
            }, 400);
        }
    });
        
    } catch(err) { common.PutToDebugLogException(2, "_dialpad: onCreate", err); }
}

function PutNumber(val)
{
    try{
    var nrfield = document.getElementById('phone_number');
    
    if (j$('#phone_number').is(':focus')) // don't write any characters, if input is focused
    {
        return;
    }
    
    if ( common.isNull(nrfield) ) { return; }
    
    if ( common.isNull(nrfield.value) ) { nrfield.value = ''; }
    
    nrfield.value = nrfield.value + val;
    
    var nrval = nrfield.value;
    if (common.isNull(nrval)) { nrval = ''; }
    nrval = common.ReplaceAll(nrval, '+', '');
    nrval = common.ReplaceAll(nrval, '*', '');
    nrval = common.ReplaceAll(nrval, '#', '');
    if (!common.isNull(val) && common.IsNumber(val) && common.IsNumber(nrval))
    {
        common.PlayDtmfSound(val);
    }
    
    issearch = false;
    PhoneInputOnChange();
    
    } catch(err) { common.PutToDebugLogException(2, "_dialpad: PutNumber", err); }
}

function PutCharLongpress(carr) // handle dialpad long press (taphold)
{
    try{
    var nrfield = document.getElementById('phone_number');
    if ( common.isNull(nrfield) ) { return; }
    
    if ( common.isNull(nrfield.value) ) { nrfield.value = ''; }
    if (common.isNull(carr) || carr.length < 1) { return; }
    
    if (carr.length === 1)
    {
        nrfield.value = nrfield.value + carr[0];
        return;
    }
//--    !!! NOT IMPLEMENTED YET
//-- show popup with letter options, just like in android
//--    ...
    issearch = false;
    PhoneInputOnChange();
    
    } catch(err) { common.PutToDebugLogException(2, "_dialpad: PutCharLongpress", err); }
}

var showratewhiletype_minlenth = -1;
var showratewhiletype_maxlenth = -1;
var issearch = true;
function PhoneInputOnChange()
{
    try{
    var field = document.getElementById('phone_number');
    var nrval = '';
    
    if (common.isNull(field) || common.isNull(field.value))
    {
        return;
    }
    
    nrval = field.value;
    
    if (nrval.length > 0)
    {
        j$("#btn_backspace").show();
    
    // so phone number text will be centered
        j$("#phone_number_container .ui-input-text").css("text-align", "center");
        j$("#phone_number_container .ui-input-text:focus").css("text-align", "center");
    }else
    {
        j$("#btn_backspace").hide();
    // so cursor will blink on the left
        j$("#phone_number_container .ui-input-text").css("text-align", "left");
        j$("#phone_number_container .ui-input-text:focus").css("text-align", "left");
        issearch = true;
    }
    
    nrval = common.Trim(nrval);
    
    var dialpadvisible = false;
    if (j$('#dialpad_btn_grid').is(':visible'))
    {
        dialpadvisible = true;
    }
    
    if (issearch && nrval.length > 0 && !common.isNull(global.ctlist) && global.ctlist.length > 0)
    {
        PopulateListContacts(nrval);
    }else
    {
        PopulateListRecents();
    }
    
    if (dialpadvisible) // if dialpad was visible, then dn't hide it after PopulateList
    {
        j$('#dialpad_btn_grid').show();
        MeasureDialPad();
    }
    
// showratewhiletype = 0; // show rating on dialpad page, while typing the destination number  // 0=no, 1=yes
    if (global.showratewhiletype_cache > 0 && common.GetParameter('ratingrequest').length > 0)
    {
        if (showratewhiletype_minlenth < 0)
        {
            var srmin = common.GetParameter2('showratewhiletype_minlenth');
            if (!common.isNull(srmin) && common.IsNumber(srmin))
            {
                showratewhiletype_minlenth = common.StrToInt(srmin);
            }else
            {
                showratewhiletype_minlenth = 3;
            }
            var srmax = common.GetParameter2('showratewhiletype_maxlenth');
            if (!common.isNull(srmax) && common.IsNumber(srmax))
            {
                showratewhiletype_maxlenth = common.StrToInt(srmax);
            }else
            {
                showratewhiletype_maxlenth = 6;
            }
        }
        
        if (nrval.length >= showratewhiletype_minlenth && nrval.length <= showratewhiletype_maxlenth)
        {
            common.UriParser(common.GetParameter('ratingrequest'), '', nrval, '', '', 'getrating');
//--            var datain = '{"data":{"0":{"prefix":"4075","voice_rate":"0.30","description":"ROMANIA - MOBILE ORANGE"},"currency":"USD","currency_sign":"$"},"error":""}';
//--            common.HttpResponseHandler(datain, 'getrating');
        }else
        {
            j$('#disprate_container').html('&nbsp;');
        }
    }
    
    } catch(err) { common.PutToDebugLogException(2, "_dialpad: PhoneInputOnChange", err); }
}

function BackSpaceClick()
{
    try{
    var field = document.getElementById('phone_number');

    if ( common.isNull(field) || common.isNull(field.value) || field.value.length < 1 ) { return; }

    field.value = (field.value).substring(0, field.value.length - 1);

    PhoneInputOnChange();
    
    } catch(err) { common.PutToDebugLogException(2, "_dialpad: BackSpaceClick", err); }
}

var ctrlDown = false;
var altDown = false;
var shiftDown = false;
var specialKeyDown = false;
var ctrlKey = 17, vKey = 86, cKey = 67, altKey = 18, shiftKey = 16;
function HandleKeyPress(event)
{
    try{
//-- don't catch input if a popup is open, because popups can have input boxes, and we won't be able to write into them
    if (j$(".ui-page-active .ui-popup-active").length > 0)
    {
         return false;
    }
    
    var charCode = (event.keyCode) ? event.keyCode : event.which; // workaround for firefox

    // listen for control key, so we don't catch ctrl+c, ctrl+v
    if (ctrlDown || altDown || shiftDown || specialKeyDown || charCode === 8)
    {
        return false;
    }
    
//--    if ( charCode === 8) // backspace
//--    {
//--        event.preventDefault();
//--        BackSpaceClick();
//--    }
//--    else if ( charCode === 13)
//--    {
//--        event.preventDefault();
//--        j$("#btn_call").click();
//--    }else
//--    {
//--        event.preventDefault();
        PutNumber(String.fromCharCode(charCode));
//--    }

    return false;
    } catch(err) { common.PutToDebugLogException(2, "_dialpad: HandleKeyPress", err); }
}
        
function StartCall(number, isvideo)
{
    try{
    if (common.isNull(number) || number.length < 1)
    {
        common.PutToDebugLog(2, "EVENT, _dialpad: StartCall number is NULL");
        return;
    }
    
    number = common.NormalizeNumber(number);
    
    if (isvideo === true)
    {
        common.PutToDebugLog(4, 'EVENT, _dialpad initiate video call to: ' + number);
        webphone_api.videocall(number);
    }else
    {
        common.PutToDebugLog(4, 'EVENT, _dialpad initiate call to: ' + number);
        webphone_api.call(number, -1);
    }

//--    j$.mobile.changePage("#page_call", { transition: "pop", role: "page" });
        
    } catch(err) { common.PutToDebugLogException(2, "_dialpad: StartCall", err); }
}

function QuickCall()
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
'<div id="quickcall_popup" data-role="popup" class="ui-content messagePopup" data-overlay-theme="a" data-theme="a" style="max-width:' + popupWidth + 'px;">' +

    '<div data-role="header" data-theme="b">' +
        '<a href="javascript:;" data-role="button" data-icon="delete" data-iconpos="notext" class="ui-btn-right closePopup">Close</a>' +
        '<h1 class="adialog_title">' + stringres.get('quickcall_title') + '</h1>' +
    '</div>' +
    '<div role="main" class="ui-content adialog_content">' +
        '<span>' + stringres.get('quickcall_msg') + '</span>' +
        '<input type="text" id="quickcall_input" name="setting_item" data-theme="a" autocapitalize="off"/>' +
    '</div>' +
    '<div data-role="footer" data-theme="b" class="adialog_footer">' +
        '<a href="javascript:;" id="adialog_positive" class="ui-btn ui-corner-all ui-shadow ui-btn-inline ui-btn-b adialog_2button" data-rel="back" data-transition="flow">' + stringres.get('btn_quickcall') + '</a>' +
        '<a href="javascript:;" id="adialog_negative" class="ui-btn ui-corner-all ui-shadow ui-btn-inline ui-btn-b adialog_2button" data-rel="back">' + stringres.get('btn_cancel') + '</a>' +
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
            j$('#adialog_positive').off('click');
            j$('#adialog_negative').off('click');
            popupafterclose();
        }
    });

    var textBox = document.getElementById('quickcall_input');

    if (!common.isNull(textBox)) { textBox.focus(); } // setting cursor to text input

    j$('#adialog_positive').on('click', function (event)
    {
        j$( '#quickcall_popup' ).on( 'popupafterclose', function( event )
        {
            common.PutToDebugLog(5,"EVENT, _dialpad SetVoiceMailNumber OK click");

            var qnr = '';
            if (!common.isNull(textBox)) { qnr = textBox.value; }

            if (!common.isNull(qnr) && qnr.length > 0)
            {
                qnr = common.Trim(qnr);

                if (qnr.length > 0)
                {
                    StartCall(qnr);
                }
            }
        });
    });
    
    
    
//--    j$.mobile.activePage.find(".messagePopup").popup().popup("open").bind(
//--    {
//--        popupafterclose: function ()
//--        {
//--            j$(this).unbind("popupafterclose").remove();
            
//--            j$('#log_window_ul').off('click', 'li');
//--            popupafterclose();
//--        }
//--    });
//--    j$('#log_window_ul').on('click', 'li', function(event)
//--    {
//--        var itemid = j$(this).attr('id');
//--        j$( '#quickcall_popup' ).on( 'popupafterclose', function( event )
//--        {
    
    j$('#adialog_negative').on('click', function (event)
    {
        ;
    });
        
    } catch(err) { common.PutToDebugLogException(2, "_dialpad: QuickCall", err); }
}

function onStart(event)
{
    try{
    common.PutToDebugLog(4, "EVENT, _dialpad: onStart");
    
    if (common.HideSettings('page_contacts', '', 'page_contacts', true))
    {
        j$("#li_nav_dp_ct").remove();
        var count = j$("#ul_nav_dp").children().length;
        var tabwidth = Math.floor(100 / count);
        
        j$('#ul_nav_dp').children('li').each(function ()
        {
            j$(this).css('width', tabwidth + '%');
        });
        
        if (count < 2)
        {
            j$('#ul_nav_dp').remove();
            MeasureDialPad();
        }
    }
    if (common.HideSettings('page_history', '', 'page_history', true))
    {
        j$("#li_nav_dp_ch").remove();
        var count = j$("#ul_nav_dp").children().length;
        var tabwidth = Math.floor(100 / count);
        
        j$('#ul_nav_dp').children('li').each(function ()
        {
            j$(this).css('width', tabwidth + '%');
        });
        
        if (count < 2)
        {
            j$('#ul_nav_dp').remove();
            MeasureDialPad();
        }
    }
    
    if (global.pagewasrefreshed === true)
    {
        common.PutToDebugLog(4, "EVENT, _dialpad: onStart page refresh detected, go back to settings page");
        common.OpenSettings(false);
        return;
    }
    
    if (!common.isNull(document.getElementById('status_dialpad')) && global.dploadingdisplayed === false)
    {
        global.dploadingdisplayed = true;
        document.getElementById('status_dialpad').innerHTML = stringres.get('loading');
        common.PutToDebugLogSpecial(1, 'EVENT, _dialpad: onStart display Loading...', false, '');
    }
    
    global.isDialpadStarted = true;
    
    common.HideModalLoader();
    
//--    setTimeout(function );

//--!!DEPERECATED 
//--    ShowNativePluginOption();
//-- THIS TYPE OF HEADER NOTIFICATION IS NOT NEEDED ON DIALPAD -> check push level comments
//--    common.ShowEngineOptionOnPage(function (msg, enginetouse)
//--    {
//--        if (common.isNull(msg) || msg.length < 1 || common.isNull(enginetouse) || enginetouse.length < 1) { return; }
//--        if (enginetouse !== 'java' && enginetouse !== 'webrtc' && enginetouse !== 'ns' && enginetouse !== 'flash' && enginetouse !== 'app')
//--        {
//--            return;
//--        }
        
//--        j$('#dialpad_engine').show();
//--        j$('#dialpad_engine_title').html(stringres.get('choose_engine_title'));
//--        j$('#dialpad_engine_msg').html(msg);
        
//--        if (enginetouse === 'java')
//--        {
//--            var javainstalled = common.IsJavaInstalled(); // 0=no, 1=installed, but not enabled in browser, 2=installed and enabled

//--            if (javainstalled === 0)
//--            {                
//--                j$('#btn_dialpad_engine').attr('href', global.INSTALL_JAVA_URL);
//--            }
//--            else if (javainstalled === 1)
//--            {
//--                if (common.GetBrowser() === 'MSIE') // can't detect if installed or just not allowed
//--                {
//--                    j$('#btn_dialpad_engine').attr('href', global.INSTALL_JAVA_URL);
//--                }else
//--                {
//--                    j$('#btn_dialpad_engine').attr('href', global.ENABLE_JAVA_URL);
//--                }
//--            }
//--        }
//--        else if (enginetouse === 'webrtc')
//--        {
//--            ;
//--        }
//--        else if (enginetouse === 'ns')
//--        {
//--            j$('#btn_dialpad_engine').attr('href', common.GetNPLocation());
//--        }
//--        else if (enginetouse === 'flash')
//--        {
//--            ; // akos todo: implement for flash
//--        }
//--        else if (enginetouse === 'app')
//--        {
//--            ;
//--        }
        
//--        chooseenginetouse = enginetouse;
        
//--        MeasureDialPad();
//--    });

    j$("#phone_number").attr("placeholder", stringres.get("phone_nr"));
    if (common.GetConfigInt('brandid', -1) === 50) // favafone
    {
        j$("#phone_number").attr("placeholder", stringres.get("phone_nr2"));
    }
    else if (common.GetConfigInt('brandid', -1) === 60) // voipmuch
    {
        j$("#phone_number").attr("placeholder", "Enter # or Contact Name");
        j$("#phone_number_container .ui-input-text").css("font-size", "1.2em");
        j$("#phone_number_container .ui-input-text:focus").css("font-size", "1.2em");
    }
    j$("#btn_backspace").hide();
    j$('#disprate_container').html('&nbsp;');
    
    if (!common.isNull(document.getElementById("app_name_dialpad"))
        && common.GetParameter('devicetype') !== common.DEVICE_WIN_SOFTPHONE())
    {
        document.getElementById("app_name_dialpad").innerHTML = common.GetBrandName();
    }
    
    if (!common.isNull(document.getElementById('dialpad_title')))
    {
        document.getElementById('dialpad_title').innerHTML = stringres.get('dialpad_title');
    }
    j$("#dialpad_title").attr("title", stringres.get("hint_page"));
    
    var curruser = common.GetParameter('sipusername');
    if (!common.isNull(curruser) && curruser.length > 0) { j$('#curr_user_dialpad').html(curruser); }
// set status width so it's uses all space to curr_user
    var statwidth = common.GetDeviceWidth() - j$('#curr_user_dialpad').width() - 25;
    if (!common.isNull(statwidth) && common.IsNumber(statwidth))
    {
        j$('#status_dialpad').width(statwidth);
    }
    
//--autoprov: if no voicemail - then fast call: text input number to call
    if (common.GetParameterInt('voicemail', 2) !== 2)
    {
        j$('#btn_voicemail_img').attr('src', '' + common.GetElementSource() + 'images/btn_call_quick_txt.png');
        j$("#btn_voicemail").attr("title", stringres.get("hint_quickcall"));
    }else
    {
        j$('#btn_voicemail_img').attr('src', '' + common.GetElementSource() + 'images/btn_voicemail_txt.png');
        j$("#btn_voicemail").attr("title", stringres.get("hint_voicemail"));
    }
    
    if ((common.GetParameter('header')).length > 2)
    {
        j$('#headertext_settings').show();
        j$('#headertext_settings').html(common.GetParameter('header'));
    }else
    {
        j$('#headertext_settings').hide();
    }
    if ((common.GetParameter('footer')).length > 2)
    {
        j$('#footertext_dialpad').show();
        j$('#footertext_dialpad').html(common.GetParameter('footer'));
    }else
    {
        j$('#footertext_dialpad').hide();
    }
    
    if (common.GetConfigInt('brandid', -1) === 50) //--Favafone
    {
        j$("#btn_message_img").attr("src", '' + common.GetElementSource() + 'images/icon_recharge_dollar.png');
    }
    

    setTimeout(function ()
    {
        common.CanShowLicKeyInput();
    }, 3500);
    
    common.CheckInternetConnection();
    common.ShowNotifications2();
    GetCallhistory();
    
// handle hidesettings
    if (common.HideSettings('chat', stringres.get('sett_display_name_' + 'chat'), 'chat', true) === true && common.GetConfigInt('brandid', -1) !== 60) // 101VOICEDT500
    {
        j$('#btn_message button').hide();
    }
    if (common.HideSettings('voicemail', stringres.get('sett_display_name_' + 'voicemail'), 'voicemail', true) === true)
    {
        if (btn_isvoicemail === true)
        {
            j$('#btn_showhide_numpad button').hide();
        }else
        {
            j$('#btn_showhide_numpad button').show();
        }
    }
    
    
    if (common.GetConfigInt('brandid', -1) === 58) //-- enikma
    {
        var logodiv = document.getElementById('app_name_dialpad');
        if (!common.isNull(logodiv))
        {
            var middle = document.getElementById('dialpad_title');
            logodiv.style.display = 'inline';
            if (!common.isNull(middle)) { middle.style.display = 'none'; }
            document.getElementById('dialpad_additional_header_left').style.width = '65%';
            logodiv.innerHTML = '<img src="' + common.GetElementSource() + 'images/logo.png" style="border: 0;">&nbsp;&nbsp;&nbsp;<div class="adhead_custom_brand" style=""><b>eNikMa</b> Unified Comm</div>';
        }
    }
    
// don't display Voicemail if we have custom menus 
    var custm_uri = common.GetParameter('menu_url');
    if (!common.isNull(custm_uri) || custm_uri.length > 3)
    {
        btn_isvoicemail = false;
        j$("#btn_showhide_numpad_img").attr("src", '' + common.GetElementSource() + 'images/btn_numpad_txt.png');
        j$("#btn_showhide_numpad").attr("title", stringres.get("hint_numpad"));
    }
    
    
    MeasureDialPad();
    
    setTimeout(function ()
    {
//--    if (!global.isdebugversionakos) { common.StartPresence2(); }
        common.StartPresence2();
    }, 2500);
    
    if (common.IsIeVersion(10)) { j$("#dialpad_list").children().css('line-height', 'normal'); }
    if (common.IsIeVersion(10)) { j$("#dialpad_notification_list").children().css('line-height', 'normal'); }
    j$("#dialpad_notification_list").height(common.GetDeviceHeight() - 55);
    
    common.ShowOfferSaveContact();
//--    HandleAutoaction();
    
    var pnr = document.getElementById('phone_number');
    if (!common.isNull(pnr) && common.GetOs() !== 'Android' && common.GetOs() !== 'iOS') { pnr.focus(); }
    
    } catch(err) { common.PutToDebugLogException(2, "_dialpad: onStart", err); }
}

function GetCallhistory()
{
    try{
    if ((common.isNull(global.chlist) || global.chlist.length < 1) && global.readcallhistoryforrecents)
    {
        common.ReadCallhistoryFile(function (success)
        {
            if (!success)
            {
                common.PutToDebugLog(2, 'EVENT, _dialpad: load call history failed (2) GetCallhistory');
            }
            
            PopulateListRecents();
        });

//also read contacts in background
        setTimeout(function ()
        {
            common.GetContacts(function (success)
            {
                if (!success)
                {
                    common.PutToDebugLog(2, 'EVENT, _dialpad: LoadContacts failed GetCallhistory');
                }
            });
        }, 1000);
    }
    
    } catch(err) { common.PutToDebugLogException(2, "_dialpad: GetCallhistory", err); }

    PopulateListRecents();
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

// points for recents list
var LAST_CALLED = 1200;
var IS_ONLINE = 100;
var LAST_HOUR = 70;
var LAST_5HOURS = 50;
var LAST_DAY = 40;
var LAST_WEEK = 30;
var LAST_MONTH = 20;
var LAST_3MONTHS = 10;
var LAST_YEAR = 3;
var OUTGOING_CALL = 10;
var IS_CONTACT = 5; // if can be found in contacts list
var FAVORITE = 1.4; // multiply by
var IS_BLOCKED = 10; // divide by this value

function GetRecents()
{
    var enablepres = false;
    var presencequery = [];
    try{
    if (common.isNull(global.chlist) || global.chlist.length < 1 || (global.refreshrecents === false && global.recentlist.length > 0))
    {
        return;
    }
    
    if (common.UsePresence2() === true)
    {
        enablepres = true;
    }
    
    var chtmp = [];
    var rectmp = [];
    
    if (global.chlist.length > 500)
    {
        chtmp = global.chlist.slice(0, 499);
    }else
    {
        chtmp = global.chlist;
    }
    
    if (common.isNull(chtmp) || chtmp.length < 1)
    {
        common.PutToDebugLog(2, 'ERROR, _dialpad: GetRecents list is NULL');
        return;
    }
    
    var now = common.GetTickCount();
    
    for (var i = 0; i < chtmp.length; i++)
    {
        if (common.isNull(chtmp[i])) { continue; }
        
        var item = chtmp[i];
        if (common.isNull(item[common.CH_NUMBER]) || item[common.CH_NUMBER].length < 1) { continue; }
        
        if (common.IsContactBlocked(item[common.CH_NUMBER], null) === true) { continue; }

// calculating points
        var points = 0;
        var dateint = 0;
        try{
            dateint = common.StrToInt( common.Trim(item[common.CH_DATE]) );
        
        } catch(errin1) { common.PutToDebugLogException(2, "_dialpad: GetRecents convert duration", errin1); }
        
        var diff = now - dateint;
        
        if (diff > 0)
        {
            if (rectmp.length === 0) // means it's the last call
            {
                points = points + LAST_CALLED;
            }
            else if (diff < 3600000) // less then an hour
            {
                points = points + LAST_HOUR;
            }
            else if (diff < 18000000) // less then 5 hours
            {
                points = points + LAST_5HOURS;
            }
            else if (diff < 86400000) // less then 1 day
            {
                points = points + LAST_DAY;
            }
            else if (diff < 604800000) // less then 1 week
            {
                points = points + LAST_WEEK;
            }
            else if (diff < 2592000000) // less then 1 month
            {
                points = points + LAST_MONTH;
            }
            else if (diff < 31104000000) // less then 1 year
            {
                points = points + LAST_YEAR;
            }
        }
        
        if (enablepres)
        {
            var presence = '-1';
            var presobj = global.presenceHM[item[common.CH_NUMBER]];
            if (!common.isNull(presobj)) { presence = presobj[common.PRES_STATUS]; }

            // -1=not exists(undefined), 0=offline, 1=invisible, 2=idle, 3=pending, 4=DND, 5=online
            if (!common.isNull(presence)) // available
            {
                if (presence === '5')
                {
                    points = points + IS_ONLINE;
                }
                else if ((presence === '0' || presence === '1' || presence === '4') && points > 10)
                {
                    points = Math.floor(points / 2);
                }else
                {
                    points = Math.floor(points / 1.5);
                }
            }

            if (common.isNull(presence) || presence.length < 1 || presence === '-1')
            {
                if (common.isNull(presencequery)) { presencequery = []; }
                if (presencequery.indexOf(item[common.CH_NUMBER]) < 0)
                {
                    presencequery.push(item[common.CH_NUMBER]);
                }
            }
        }
        
        /* type 0=outgoing call, 1=incomming call, 2=missed call - not viewed, 3=missed call - viwed*/
        if (item[common.CH_TYPE] !== '1')
        {
            points = points + OUTGOING_CALL;
        }
        
        var exists = -1;
        for (var j = 0; j < rectmp.length; j++)
        {
            if (rectmp[j][common.RC_NUMBER] === item[common.CH_NUMBER])
            {
                exists = j;
                break;
            }
        }
        
    // check if contact is blocked
        if (common.IsContactBlocked(item[common.CH_NUMBER]) && points > 5)
        {
            points = Math.floor(points / IS_BLOCKED);
        }
        
    // check if is favorite
        var ctidtmp = common.GetContactIdFromNumber(item[common.CH_NUMBER]);
        if (!common.isNull(ctidtmp) && common.IsNumber(ctidtmp))
        {
            if (common.ContactIsFavorite(ctidtmp) === true)
            {
                points = points * FAVORITE;
            }
        }
        
        if (exists >= 0)
        {
            var pointstmp = 0;
            try{
                var potmp = rectmp[exists][common.RC_RANK];
                if (typeof (potmp) !== 'number')
                {
                    pointstmp = common.StrToInt( common.Trim(rectmp[exists][common.RC_RANK]) );  
                }else
                {
                    pointstmp = potmp;
                }
            } catch(errin2) { common.PutToDebugLogException(2, "_dialpad: GetRecents convert points", errin2); }
            
            pointstmp = pointstmp + points;
            
            rectmp[exists][common.RC_RANK] = pointstmp;
        }else
        {
            var entry = [];
            
            entry[common.RC_TYPE] = item[common.CH_TYPE];
            entry[common.RC_NAME] = item[common.CH_NAME];
            entry[common.RC_NUMBER] = item[common.CH_NUMBER];
            entry[common.RC_DATE] = item[common.CH_DATE];
            entry[common.RC_RANK] = points;

            rectmp.push(entry);
        }
    }
    
    global.recentlist = rectmp;
    global.refreshrecents = false;
    SortRecents();
    
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

    } catch(err) { common.PutToDebugLogException(2, "_dialpad: GetRecents", err); }
}

function SortRecents()
{
    try{
    global.recentlist.sort(function (a,b) // comparator function
    {
        var anr = a[common.RC_RANK];
        var bnr = b[common.RC_RANK];
        
        if ( anr < bnr ) { return 1; }
        if ( anr > bnr ) { return -1; }
        return 0;
    });
    } catch(err) { PutToDebugLogException(2, "_dialpad: SortRecents", err); }
}

function PopulateListRecents() // :no return value
{
    var itemstodisplay = global.nrofrecentstodisplay; // max number of items to display
    var enablepres = false;
    try{
//--    if (common.HideSettings('recents', '', 'recents', true) === true) { return; }
    
    if ( common.isNull(document.getElementById('dialpad_list')) )
    {
        common.PutToDebugLog(2, "ERROR, _dialpad: PopulateListRecents listelement is null");
        return;
    }
    
    GetRecents();
    
    if ( common.isNull(global.recentlist) || global.recentlist.length < 1 ||
            common.HideSettings('recents', '', 'recents', true) === true)
    {
        j$('#dialpad_btn_grid').show();
        j$('#dialpad_list').html('');
        MeasureDialPad();
        common.PutToDebugLog(2, "EVENT, _dialpad: PopulateListRecents no recents");
        
    // don't display Voicemail if we have custom menus
        var custm_uri = common.GetParameter('menu_url');
        if (!common.isNull(custm_uri) || custm_uri.length > 3)
        {
            btn_isvoicemail = false;
            j$("#btn_showhide_numpad_img").attr("src", '' + common.GetElementSource() + 'images/btn_numpad_txt.png');
            j$("#btn_showhide_numpad").attr("title", stringres.get("hint_numpad"));
            return;
        }
        

        if (common.GetConfigInt('brandid', -1) !== 60) //-- 101VOICEDT500
        {
            btn_isvoicemail = true;
            j$("#btn_showhide_numpad_img").attr("src", '' + common.GetElementSource() + 'images/btn_voicemail_txt_big.png');
            j$("#btn_showhide_numpad").attr("title", stringres.get("hint_voicemail"));
        }
        return;
    }else
    {
        btn_isvoicemail = false;
        j$("#btn_showhide_numpad_img").attr("src", '' + common.GetElementSource() + 'images/btn_numpad_txt.png');
        j$("#btn_showhide_numpad").attr("title", stringres.get("hint_numpad"));
//--         intructions Moved after populating is done because MeasuerDialpad() checks the content of the list
    }
    
    showfulldialpad = false;
    
    if (global.recentlist.length < itemstodisplay)
    {
        itemstodisplay = global.recentlist.length;
    }

// refresh the list of recents, meaning: if any unknown numbers have been saved, then get name from contacts; if contacts have been deleted, then remove name
    for (var i = 0; i < itemstodisplay; i++)
    {
        if (global.recentlist[i][common.RC_NAME] === global.recentlist[i][common.RC_NUMBER])
        {
            global.recentlist[i][common.RC_NAME] = common.GetContactNameFromNumber( global.recentlist[i][common.RC_NUMBER] );
        }else
        {
            var idtemp = common.GetContactIdFromNumber( global.recentlist[i][common.RC_NUMBER] );
            if (idtemp < 0)
            {
//--                global.recentlist[i][common.RC_NAME] = global.recentlist[i][common.RC_NUMBER];
            }else
            {
                global.recentlist[i][common.RC_NAME] = common.GetContactNameFromNumber( global.recentlist[i][common.RC_NUMBER] );
            }
        }
    }
    
    
    common.PutToDebugLog(2, 'EVENT, _dialpad Starting populate recents list');
    var recent_menu = '<a id="recentmenu_[RCID]" class="ch_menu mlistitem">' + stringres.get('hint_recents') + '</a>';
    
//-- option to disable the hamburger popup menu for recent calls (in the disablesett)  ...or just disable it if the contact page is also disabled
// add hidesettings parameter: disablecontactmenu
    if (common.HideSettings('disablecontactmenu', '', 'disablecontactmenu', false) === true || common.HideSettings('page_contacts', '', 'page_contacts', true) === true)
    {
        recent_menu = '';
    }
    
    var template = '' +
        '<li data-theme="b"><a id="recentitem_[RCID]" class="ch_anchor mlistitem">' +
            '<div class="item_container">' +
                '<div class="ch_type">' +
                    '<img src="' + common.GetElementSource() + 'images/[ICON_CALLTYPE].png" />' +
                '</div>' +
                '<div class="ch_numberonly">[NUMBERONLY]</div>' +
                '<div class="ch_data">' +
                    '<div class="ch_name">[NAME]</div>' +
                    '<div class="ch_number">[NUMBER]</div>' +
                '</div>' +
                '<div class="ch_presence">[PRESENCE]</div>' + // <img src="images/presence_available.png" />
                '<div class="ch_date">[DATE]</div>' + // Aug, 26 2013 10:55
            '</div>' +
        '</a>' +
        recent_menu +
        '</li>';

    var listview = '';
    
    if (common.UsePresence2() === true)
    {
        enablepres = true;
    }
    
    for (var i = 0; i < itemstodisplay; i++)
    {
        var item = global.recentlist[i];
        if ( common.isNull(item) || item.length < 1 ) { continue; }
        
        /* type 0=outgoing call, 1=incomming call, 2=missed call - not viewed, 3=missed call - viwed*/
        
        var icon = 'icon_call_missed';

        if (item[common.RC_TYPE] === '0') { icon = 'icon_call_outgoing'; }
        if (item[common.RC_TYPE] === '1') { icon = 'icon_call_incoming'; }
        
        var datecallint = 0;
        try{
            datecallint = common.StrToInt( common.Trim(item[common.RC_DATE]) );
        
        } catch(errin1) { common.PutToDebugLogException(2, "_dialpad: PopulateListRecents convert duration", errin1); }
        
//--Aug, 26 2013 10:55
        var datecall = new Date(datecallint);
        
        var minutes = datecall.getMinutes();
        if (minutes < 10) { minutes = '0' + minutes; }
        
        var day = datecall.getDate(); // getDay returns the day of the week
        if (day < 10) { day = '0' + day; }
        
//--        var seconds = datecall.getSeconds();
//--        if (seconds < 10) { seconds = '0' + seconds; }
        
        var daetcallstr = month[datecall.getMonth()] + ', ' + day + '&nbsp;&nbsp;' + datecall.getFullYear()+ '&nbsp;&nbsp;'
                + datecall.getHours() + ':' + minutes;//-- + ':' + seconds;
        
        var lisitem = template.replace('[RCID]', i);
        lisitem = lisitem.replace('[RCID]', i);
        lisitem = lisitem.replace('[ICON_CALLTYPE]', icon);
        
        if (item[common.RC_NAME] === item[common.RC_NUMBER])
        {
            lisitem = lisitem.replace('[NUMBERONLY]', item[common.RC_NUMBER]);
            lisitem = lisitem.replace('[NAME]', '');
            lisitem = lisitem.replace('[NUMBER]', '');
        }else
        {
            lisitem = lisitem.replace('[NUMBERONLY]', '');
            lisitem = lisitem.replace('[NAME]', item[common.RC_NAME]);
            lisitem = lisitem.replace('[NUMBER]', item[common.RC_NUMBER]);
        }
        lisitem = lisitem.replace('[DATE]', daetcallstr);
        
        var presenceimg = ''; //<img src="images/presence_available.png" />
        
        if (enablepres)
        {
            var phonenr = item[common.RC_NUMBER];
            
            var presence = '-1';
            var presobj = global.presenceHM[phonenr];
            if (!common.isNull(presobj)) { presence = presobj[common.PRES_STATUS]; }

            // -1=not exists(undefined), 0=offline, 1=invisible, 2=idle, 3=pending, 4=DND, 5=online
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
        }
        
        lisitem = lisitem.replace('[PRESENCE]', presenceimg);

        listview = listview + lisitem;
    }
    
    j$('#dialpad_list').html('');
    j$('#dialpad_list').append(listview).listview('refresh');
    
    if ( common.isNull(global.recentlist) || global.recentlist.length < 1 )
    {
        ;
    }else
    {
//--         intructions Moved after populating is done because MeasuerDialpad() checks the content of the list
//--        j$('#dialpad_btn_grid').hide();
        
// if list height greater than available space, the hide dialpad
        var liheight = j$("#dialpad_list li").height();

        if (!common.isNull(liheight) && common.IsNumber(liheight) && j$('#dialpad_btn_grid').is(':visible'))
        {
            j$("#dialpad_btn_grid .ui-btn").height('auto');

            var count = global.nrofrecentstodisplay;
            if (count > global.recentlist.length) { count = global.recentlist.length; }
            var listheight = count * liheight;

            var availablespace = common.GetDeviceHeight() - j$("#dialpad_header").height()
                            - j$("#phone_number_container").height()
                            - j$("#dialpad_footer").height()
                            - common.StrToIntPx(j$("#dialpad_header").css("border-top-width"))
                            - common.StrToIntPx(j$("#dialpad_header").css("border-bottom-width"));
                            - 2 * (j$(".separator_color_bg").height());

            availablespace = availablespace - j$("#dialpad_btn_grid").height();

            if (availablespace < listheight)
            {
                j$('#dialpad_btn_grid').hide();
            }
        }
        
        MeasureDialPad();
    }
    
    } catch(err) { common.PutToDebugLogException(2, "_dialpad: PopulateListRecents", err); }
}

function PopulateListContacts(nrval) // :no return value
{
    try{
    if (common.isNull(nrval) || nrval.length < 1)
    {
        PopulateListRecents();
        return;
    }
    
    showfulldialpad = false;
    
    if ( common.isNull(document.getElementById('dialpad_list')) )
    {
        common.PutToDebugLog(2, "ERROR, _dialpad: PopulateListContacts listelement is null");
        return;
    }
    
    SearchContacts(nrval);
    
    common.PutToDebugLog(2, 'EVENT, _dialpad Starting populate searched contact list');
    
    var template = '' +
        '<li data-theme="b"><a id="searcheditem_[CTID]" class="ch_anchor">' +
            '<div class="item_container">' +
                '<div class="ch_ctname">[NAME]</div>' +
                '<div id="ch_ctnumber_[CTID]" class="ch_ctnumber">[NUMBER]</div>' +
            '</div>' +
        '</a>' +
        '<a id="searchedmenu_[CTID]" class="ch_menu">Menu</a>' +
        '</li>';

    var listview = '';
    
    for (var i = 0; i < global.searchctlist.length; i++)
    {
        if ( common.isNull(global.searchctlist[i]) || global.searchctlist[i].length < 1 ) { continue; }
        
        var lisitem = template.replace('[CTID]', i);
        lisitem = lisitem.replace('[CTID]', i);
        lisitem = lisitem.replace('[CTID]', i);
        lisitem = lisitem.replace('[NAME]', global.searchctlist[i][common.CT_NAME]);
        lisitem = lisitem.replace('[NUMBER]', global.searchctlist[i][common.CT_NUMBER]);

        listview = listview + lisitem;
    }
    
    j$('#dialpad_list').html('');
    j$('#dialpad_list').append(listview).listview('refresh');
    
    } catch(err) { common.PutToDebugLogException(2, "_dialpad: PopulateListContacts", err); }
}

function SearchContacts(searchval)
{
    try{
    if (common.isNull(searchval) || (common.Trim(searchval)).lengh < 1)
    {
        common.PutToDebugLog(2, 'ERROR, _dialpad: SearchContacts value is NULL');
        return;
    }
    
    searchval = searchval.toLowerCase();
    global.searchctlist = [];
    
//--     String Name, String[] {numbers/sip uris}, String[] {number types}, int usage, long lastmodified, int delete flag, int isfavorit
//--    var ctitem = ['Ambrus Akos', ['40724335358', '0268123456', '13245679'], ['home', 'work', 'other'], '0', '13464346', '0', '0'];

    for (var i = 0; i < global.ctlist.length; i++)
    {
        var add = false;
        var ctTemp = global.ctlist[i].slice(0);
        if (common.isNull(ctTemp))
        {
            continue;
        }
        
        if ( (ctTemp[common.CT_NAME].toLowerCase()).indexOf(searchval) >= 0 )
        {
            add = true;
// add an entry in searchctlist for every phone number
            for (var j = 0; j < ctTemp[common.CT_NUMBER].length; j++)
            {
                var entry = ctTemp.slice(0);
                
                var nr = ctTemp[common.CT_NUMBER][j];
                
                entry[common.CT_NUMBER] = ctTemp[common.CT_NUMBER][j];
                
                global.searchctlist.push(entry);
            }
        }
        
        if (add === false && !common.isNull(ctTemp[common.CT_NUMBER]))
        {
            for (var j = 0; j < ctTemp[common.CT_NUMBER].length; j++)
            {
                if ( ((ctTemp[common.CT_NUMBER][j]).toLowerCase()).indexOf(searchval) >= 0 )
                {
                    var entry = ctTemp;
                
                    entry[common.CT_NUMBER] = ctTemp[common.CT_NUMBER][j];
                
                    global.searchctlist.push(entry);
                }
            }
        }
    }
    } catch(err) { common.PutToDebugLogException(2, "_dialpad: SearchContacts", err); }
}

var trigerredlist = false; // handle multiple clicks
function OnListItemClick (id, islongclick) // :no return value
{
    try{
    if (trigerredlist) { return; }
    
    trigerredlist = true;
    setTimeout(function ()
    {
        trigerredlist = false;
    }, 1000);
    
    if (common.isNull(id) || id.length < 1)
    {
        common.PutToDebugLog(2, 'ERROR, _dialpad OnListItemClick id is NULL');
        return;
    }
    
    var rcid = '';
    var pos = id.indexOf('_');
    if (pos < 2)
    {
        common.PutToDebugLog(2, 'ERROR, _dialpad OnListItemClick invalid id');
        return;
    }
    
    rcid = common.Trim(id.substring(pos + 1));
    var idint = 0;
    
    try{
        idint = common.StrToInt( common.Trim(rcid) );

    } catch(errin1) { common.PutToDebugLogException(2, "_dialpad: OnListItemClick convert rcid", errin1); }
    
    if (id.indexOf('recentitem') === 0) // means call from recents list
    {
        var to = global.recentlist[idint][common.RC_NUMBER];
        var name = global.recentlist[idint][common.RC_NAME];

        common.PutToDebugLog(2, 'EVENT, _dialpad recents call to: ' + to);
        webphone_api.call(to, -1);
    }
    else if (id.indexOf('recentmenu') === 0) // menu from recents list
    {
        RecentMenu(idint, true, islongclick);
    }
    else if (id.indexOf('searcheditem') === 0) // means call from recents list
    {
        if (islongclick === true)
        {
            RecentMenu(idint, false, islongclick);
        }else
        {
            var to = j$('#ch_ctnumber_' + idint).html();
            var name = global.searchctlist[idint][common.CT_NAME];

            common.PutToDebugLog(2, 'EVENT, _dialpad searched item call to: ' + to);
            webphone_api.call(to, -1);
        }
    }
    else if (id.indexOf('searchedmenu') === 0) // menu from recents list
    {
        RecentMenu(idint, false, islongclick);
    }
    
    } catch(err) { common.PutToDebugLogException(2, "_dialpad: OnListItemClick", err); }
}

function RecentMenu(rcid, isrecent, islongclick, popupafterclose)
{
    try{
    if (common.isNull(rcid) || rcid.length < 1 || rcid < 0 || rcid > global.recentlist.length)
    {
        common.PutToDebugLog(2, 'ERROR, RecentMenu: invalid id: ' + rcid);
        return;
    }
    
    var rcname = '';
    var rcnumber = '';
    
    if (isrecent)
    {
        rcname = global.recentlist[rcid][common.RC_NAME];
        rcnumber = global.recentlist[rcid][common.RC_NUMBER];
    }else
    {
        rcname = global.searchctlist[rcid][common.CT_NAME];
        rcnumber = j$('#ch_ctnumber_' + rcid).html();
    }
    
    if (common.isNull(rcname)) { rcname = ''; }
    if (common.isNull(rcnumber)) { rcnumber = ''; }
    
    
    if (common.GetContactIdFromNumber(rcnumber) >= 0) // if contact exists
    {
        // show context menu instead
        if (islongclick === true)
        {
            CreateContextmenu(common.GetContactIdFromNumber(rcnumber), rcname, rcnumber, popupafterclose);
        }else
        {
            global.intentctdetails[0] = 'ctid=' + common.GetContactIdFromNumber(rcnumber);
            global.intentctdetails[1] = 'frompage=dialpad';
            j$.mobile.changePage("#page_contactdetails", { transition: "none", role: "page" });
        }
    }else
    {
        // show context menu instead
        if (islongclick === true)
        {
            CreateContextmenu('-1', rcname, rcnumber, popupafterclose);
        }else
        {
            global.intentctdetails[0] = 'ctid=-1';
            global.intentctdetails[1] = 'ctname=' + rcname;
            global.intentctdetails[2] = 'ctnumber=' + rcnumber;
            global.intentctdetails[3] = 'frompage=dialpad';
            j$.mobile.changePage("#page_contactdetails", { transition: "none", role: "page" });
        }
    }
    } catch(err) { common.PutToDebugLogException(2, "_dialpad: RecentMenu", err); }
}

function CreateContextmenu(cid_in, cname, cnumber, popupafterclose)
{
    try{
    if (common.isNull(cid_in) || cid_in.length < 1 || !common.IsNumber(cid_in))
    {
        common.PutToDebugLog(2, 'ERROR, _dialpad: CreateContextmenu invalid contact id: ' + cid_in);
    }
    var cid = common.StrToInt(cid_in);

    var popupWidth = common.GetDeviceWidth();
    if ( !common.isNull(popupWidth) && common.IsNumber(popupWidth) && popupWidth > 100 )
    {
        popupWidth = Math.floor(popupWidth / 1.2);
    }else
    {
        popupWidth = 220;
    }
    
    var iscontact = false;
    if (cid > -1) { iscontact = true; }
    
    var isfavorite = false;
    if (iscontact === true) { isfavorite = common.ContactIsFavorite(cid); }
    
    var list = '';
    var item = '<li id="[ITEMID]"><a data-rel="back">[ITEMTITLE]</a></li>';
    
    var itemTemp = '';
    
    if (iscontact === true)
    {
        itemTemp = item.replace('[ITEMID]', '#dp_item_edit_contact');
        itemTemp = itemTemp.replace('[ITEMTITLE]', stringres.get('menu_editcontact'));
        list = list + itemTemp;
        itemTemp = '';

//--        itemTemp = item.replace('[ITEMID]', '#dp_item_delete_contact');
//--        itemTemp = itemTemp.replace('[ITEMTITLE]', stringres.get('menu_deletecontact'));
//--        list = list + itemTemp;
//--        itemTemp = '';
    }

// --------------------------

    itemTemp = item.replace('[ITEMID]', '#dp_item_call');
    itemTemp = itemTemp.replace('[ITEMTITLE]', stringres.get('menu_call'));
    list = list + itemTemp;
    itemTemp = '';

    if (common.CanIUseVideo() === true)
    {
        itemTemp = item.replace('[ITEMID]', '#dp_item_video_call');
        itemTemp = itemTemp.replace('[ITEMTITLE]', stringres.get('btn_videocall'));
        list = list + itemTemp;
        itemTemp = '';
    }

    itemTemp = item.replace('[ITEMID]', '#dp_item_message');
    itemTemp = itemTemp.replace('[ITEMTITLE]', stringres.get('send_msg'));
    list = list + itemTemp;
    itemTemp = '';
    
    if (common.GetConfigBool('hasfiletransfer', true) !== false && (common.GetConfigBool('usingmizuserver', false) === true || common.IsMizuWebRTCGateway() === true))
    {
        if (common.Glft() === true)
        {
            itemTemp = item.replace('[ITEMID]', '#dp_item_filetransf');
            itemTemp = itemTemp.replace('[ITEMTITLE]', stringres.get('filetransf_title'));
            list = list + itemTemp;
            itemTemp = '';
        }
    }
    
    if (iscontact === true)
    {
        var favtitle = stringres.get('menu_ct_setfavorite');
        if (isfavorite === true) { favtitle = stringres.get('menu_ct_unsetfavorite'); }
        itemTemp = item.replace('[ITEMID]', '#dp_item_favorite');
        itemTemp = itemTemp.replace('[ITEMTITLE]', favtitle);
        list = list + itemTemp;
        itemTemp = '';
    }

    var title = cname;
    if (common.isNull(title) || title.length < 1) { title = cnumber; }
    
    var template = '' +
'<div id="dp_contextmenu" data-role="popup" class="ui-content messagePopup" data-overlay-theme="a" data-theme="a" style="max-width:' + popupWidth + 'px; min-width: ' + Math.floor(popupWidth * 0.6) + 'px;">' +

    '<div data-role="header" data-theme="b">' +
        '<a href="javascript:;" data-role="button" data-icon="delete" data-iconpos="notext" class="ui-btn-right closePopup">Close</a>' +
        '<h1 class="adialog_title">' + title + '</h1>' +
    '</div>' +
    '<div role="main" class="ui-content adialog_content" style="padding: 0; margin: 0;">' +
    
        '<ul id="dp_contextmenu_ul" data-role="listview" data-inset="true" data-icon="false" style="margin: 0;">' +
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
            
            j$('#dp_contextmenu_ul').off('click', 'li');
            
            popupafterclose();
        }
    });
    
   
        
    j$('#dp_contextmenu_ul').on('click', 'li', function(event)
    {
        var itemid = j$(this).attr('id');

        j$( '#dp_contextmenu' ).on( 'popupafterclose', function( event )
        {
            j$( '#dp_contextmenu' ).off( 'popupafterclose' );

            if (itemid === '#dp_item_edit_contact')
            {        
                EditContact(cid);
            }
            else if (itemid === '#dp_item_delete_contact')
            {
                DeleteContact(cid);
            }
            else if (itemid === '#dp_item_call')
            {
                StartCall(cnumber);
                common.SaveParameter("redial", cnumber);
            }
            else if (itemid === '#dp_item_video_call')
            {
                common.SaveParameter("redial", cnumber);
                webphone_api.videocall(cnumber);
            }
            else if (itemid === '#dp_item_message')
            {
                common.StartMsg(cnumber, '', '_dialpad');
            }
            else if (itemid === '#dp_item_filetransf')
            {
                common.FileTransfer(cnumber);
            }
            else if (itemid === '#dp_item_favorite')
            {
                if (isfavorite === true)
                {
                    common.ContactSetFavorite(cid, false);
                    common.ShowToast(stringres.get('ct_unsetfavorited'), 1400);
                }else
                {
                    common.ContactSetFavorite(cid, true);
                    common.ShowToast(stringres.get('menu_ct_setfavorite'), 1400);
                }
            }
        });
    });
    } catch(err) { common.PutToDebugLogException(2, "_dialpad: CreateContextmenu", err); }
}

function EditContact(ctid) // open AddEditContact activity
{
    try{
    global.intentaddeditct[0] = 'action=edit';
    global.intentaddeditct[1] = 'ctid=' + ctid;

    j$.mobile.changePage("#page_addeditcontact", { transition: "pop", role: "page" });
    } catch(err) { common.PutToDebugLogException(2, "_dialpad: EditContact", err); }
}

function MeasureDialPad() // resolve window height size change
{
    try{
//--    var pgh = common.GetDeviceHeight() - j$("#dialpad_footer").height() - 1; j$('#page_dialpad').css('min-height', pgh + 'px'); // must be set when softphone is skin in div
    j$('#page_dialpad').css('min-height', 'auto'); // must be set when softphone is skin in div
    
    j$(".separator_line_thick").css( 'background-color', common.HoverCalc(common.getBgColor('#page_dialpad'), -30) );
    
// handle notifiaction      additional_header_right
    var notwidth = common.GetDeviceWidth() - j$("#dialpad_additional_header_left").width() - j$("#dialpad_additional_header_right").width();
    var margin = common.StrToIntPx( j$("#dialpad_additional_header_left").css("margin-left") );
    
    if (common.isNull(margin) || margin === 0) { margin = 10; }
    margin = Math.ceil( margin * 6 );
    notwidth = Math.floor(notwidth - margin) - 20;

//--    j$("#dialpad_notification").width(notwidth);
    j$("#dialpad_notification").height( Math.floor( j$("#dialpad_additional_header_left").height() ) );
    
    //dialpad_footer
    
// handle recents list height
    var contentHeight = common.GetDeviceHeight() - j$("#dialpad_header").height()
                        - j$("#phone_number_container").height()
                        - j$("#dialpad_footer").height()
                        - common.StrToIntPx(j$("#dialpad_header").css("border-top-width"))
                        - common.StrToIntPx(j$("#dialpad_header").css("border-bottom-width"));
                        - 2 * (j$(".separator_color_bg").height());
//--                        - (j$(".separator_color_bg").height());
    
//--    if (j$('#footertext_dialpad').is(':visible')) { contentHeight = contentHeight - j$("#footertext_dialpad").height(); }
    if (j$('#dialpad_btn_grid').is(':visible'))
    {
        contentHeight = contentHeight - j$("#dialpad_btn_grid").height();
    }
    
    contentHeight = contentHeight - 3;
    
    j$("#dialpad_list").height(contentHeight);
    
    
    var bname = common.GetBrandName();
    if (j$('#dialpad_title').is(':visible'))
    {
        global.bname_charcount = common.GetTextLengthThatFits('app_name_dialpad', bname, j$("#app_name_dialpad").width());
    }
    
    // if brandname does not fit, then hide title and make brandname div wider
    if (global.bname_charcount > 0 && bname.length > global.bname_charcount)
    {
        j$('#dialpad_title').remove();
        j$('#dialpad_additional_header_left').width('65%');
    }
    
    var brandW = j$("#dialpad_additional_header_left").width() - 5;
    if (j$('#dialpad_presence').is(':visible'))
    {
        var pwidth = j$("#dialpad_presence").width();
        if (pwidth === 0) { pwidth = 30; } // hack, sometimes it returns 0
        brandW = brandW - pwidth;
    }
    j$("#app_name_dialpad").width(brandW);
    

    // handle numpad height
    if ( showfulldialpad && ( common.isNull(j$('#dialpad_list').html()) || (j$('#dialpad_list').html()).length < 1 ) ) // if recents are not available, then show dialpad in full screen
    {
        var contentHeightDp = common.GetDeviceHeight() - j$("#dialpad_header").height() - common.StrToIntPx(j$("#dialpad_header").css("border-top-width"))
                - common.StrToIntPx(j$("#dialpad_header").css("border-bottom-width")) - 2 * (j$(".separator_color_bg").height());

        contentHeightDp = contentHeightDp - j$("#phone_number_container").height() - j$("#dialpad_footer").height();
        
        contentHeightDp = contentHeightDp - 4;

        var rowHeight = Math.floor(contentHeightDp / 4);
        j$("#dialpad_btn_grid .ui-btn").height(rowHeight);

    }else
    {
        j$("#dialpad_btn_grid .ui-btn").height('auto');
    }

    } catch(err) { common.PutToDebugLogException(2, "_dialpad: MeasureDialPad", err); }
}

function HandleAutoaction() // 0=nothing, 1=call (default), 2=chat, 3=video call
{
    try{
    if (global.aua_handled === true) { return; }
    global.aua_handled = true;
    var aua_str = common.GetParameter2('autoaction');
    if (common.isNull(aua_str) || !common.IsNumber(aua_str)) { return; }
    var aua = common.StrToInt(aua_str);
    if (common.isNull(aua) || aua < 1 || aua > 3) { return; }
    var ct = webphone_api.getcallto();
    if (common.isNull(ct) || ct.length < 1) { return; }
    
    if (aua === 1) // call
    {
        common.PutToDebugLog(2, 'EVENT, HandleAutoaction initiate call to: ' + ct);
        StartCall(ct, false);
    }
    else if (aua === 2) // chat
    {
        common.PutToDebugLog(2, 'EVENT, HandleAutoaction send message to: ' + ct);
        common.StartMsg(ct, '', '_dialpad');
    }
    else if (aua === 3) // video
    {
        common.PutToDebugLog(2, 'EVENT, HandleAutoaction initiate video call to: ' + ct);
        StartCall(ct, true);
    }
    } catch(err) { common.PutToDebugLogException(2, "_dialpad: HandleAutoaction", err); }
}

function MsgOnClick()
{
    try{
    if (common.GetConfigInt('brandid', -1) === 50) //-- favafone
    {
        CreditRecharge();
        return;
    }
    
    var phoneNumber = common.Trim( document.getElementById('phone_number').value );
    
    if (common.isNull(phoneNumber) || phoneNumber.length < 1)
    {
        common.StartMsg('', '', '_dialpad');	// starts msg inbox list
//--        CommonGUI.GetObj().PutToDebugLog(1,getResources().getString(R.string.err_msg_1));
    }else
    {
        common.StartMsg(phoneNumber, '', '_dialpad');
    }
    } catch(err) { common.PutToDebugLogException(2, "_dialpad: MsgOnClick", err); }
}

//--var maxloop = 0;
//--function ShowNativePluginOption()
//--{
//--    try{
//--    common.IsServiceInstalled(function (installed)
//--    {
//--        if (installed === false)
//--        {
//--            if (common.GetParameter('devicetype') === common.DEVICE_WEBPHONE()
//--            && global.enableservice  && global.useengine !== global.ENGINE_SERVICE
//--            && global.useengine !== global.ENGINE_WEBPHONE)
//--            {
//--                ;
//--            }else
//--            {
//--                return;
//--            }

//--        //!!DEPERECATED
//--            if (global.showdialpadnativeplugin < 0 && maxloop < 4 && global.isDialpadStarted)
//--            {
//--                maxloop++;
//--                setTimeout(function ()
//--                {
//--                    ShowNativePluginOption();
//--                }, 1000);

//--                return;
//--            }
//--            else if (global.showdialpadnativeplugin === 1)
//--            {
//--                j$("#dialpad_engine").show();
//--                j$("#dialpad_engine_title").html(stringres.get('serviceengine_title'));
//--                j$("#dialpad_engine_msg").html(stringres.get('serviceengine_msg'));

//--                maxloop = 0;
//--            }
//--            else if (global.showdialpadnativeplugin > 1)
//--            {
//--                maxloop = 0;
//--                NativePluginPopup();
//--            }
//--        }
//--    });
//--    } catch(err) { common.PutToDebugLogException(2, "_dialpad: MsgOnClick", err); }
//--}

function NativePluginPopup(popupafterclose) // ask user to install service plugin (service engine)
{
    common.PutToDebugLog(5, 'EVENT, _dialpad: NativePluginPopup called')
    
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
'<div id="native_plugin_popup" data-role="popup" class="ui-content messagePopup" data-overlay-theme="a" data-theme="a" style="max-width:' + popupWidth + 'px;">' +

    '<div data-role="header" data-theme="b">' +
        '<a href="javascript:;" data-role="button" data-icon="delete" data-iconpos="notext" class="ui-btn-right closePopup">Close</a>' +
        '<h1 class="adialog_title">' + stringres.get('np_popup_title') + '</h1>' +
    '</div>' +
    '<div role="main" class="ui-content adialog_content adialog_alert">' +
        '<span> ' + stringres.get('np_popup_msg') + ' </span>' +
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
            j$(this).unbind("popupbeforeposition");//--.remove();
            var maxHeight =  Math.floor( common.GetDeviceHeight() * 0.6 );  //-- j$(window).height() - 120;
            
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
        j$( '#native_plugin_popup' ).on( 'popupafterclose', function( event )
        {
            j$( '#native_plugin_popup' ).off( 'popupafterclose' );
            
            common.PutToDebugLog(5, 'EVENT, _dialpad: NativePluginPopup OK onclick');
            
//--            common.OpenWebURL(global.nativeplugin_path, stringres.get('np_download'));
            common.OpenWebURL(common.GetNPLocation(), stringres.get('np_download'));
            setTimeout(function ()
            {
                common.NPDownloadAndInstall();
            }, 150);
        });
    });
        
    } catch(err) { common.PutToDebugLogException(2, "_dialpad: NativePluginPopup", err); }
}
    

var MENUITEM_DIALPAD_PROVIDER = '#menuitem_dialpad_provider';
var MENUITEM_DIALPAD_MYACCOUNT = '#menuitem_dialpad_myaccount';
var MENUITEM_DIALPAD_P2P = '#menuitem_dialpad_p2p';
var MENUITEM_DIALPAD_CALLBACK = '#menuitem_dialpad_callback';
var MENUITEM_DIALPAD_RECHARGE = '#menuitem_dialpad_recharge';
var MENUITEM_DIALPAD_SETTINGS = '#menuitem_dialpad_settings';
var MENUITEM_HELP = '#menuitem_dialpad_help';
var MENUITEM_EXIT = '#menuitem_dialpad_exit';
var MENUITEM_DIALPAD_EXTRA = '#menuitem_dialpad_extra';
var MENUITEM_DIALPAD_ACCESSNR = '#menuitem_dialpad_accessnr';
var MENUITEM_DIALPAD_VOICEMAIL = '#menuitem_dialpad_voicemail';
var MENUITEM_DIALPAD_PROVERSION = '#menuitem_dialpad_proversion';
var MENUITEM_DIALPAD_FILETRANSFER = '#menuitem_dialpad_filetransfer';
var MENUITEM_DIALPAD_AUDIOSETTING = '#menuitem_dialpad_audiosettings';
var MENUITEM_DIALPAD_RECONNECT = '#menuitem_dialpad_reconnect';
var MENUITEM_DIALPAD_WEBCALLME = '#menuitem_dialpad_webcallme';
var MENUITEM_DIALPAD_CONFERENCEROOMS = '#menuitem_dialpad_conferencerooms';
var MENUITEM_DIALPAD_VIDEOCALL = '#menuitem_dialpad_videocall';
var MENUITEM_DIALPAD_CALLPICKUP_101VOICE = '#menuitem_dialpad_callpickup_101voice';
var MENUITEM_DIALPAD_SCREENSHARE = '#menuitem_screenshare';
var MENUITEM_DIALPAD_INTEGRATION = 'menuitem_dialpad_integration';
var MENUITEM_DIALPAD_FOLDERS = 'menuitem_dialpad_folders';

function CreateOptionsMenu (menuId) // adding items to menu, called from html
{
    try{
// remove data transition for windows softphone, because it's slow
    if (common.IsWindowsSoftphone())
    {
        j$( "#btn_dialpad_menu" ).removeAttr('data-transition');
    }
    
    if ( common.isNull(menuId) || menuId.lenght < 1 ) { common.PutToDebugLog(2, "ERROR, _dialpad: CreateOptionsMenu menuid null"); return; }

    if (j$(menuId).length <= 0) { common.PutToDebugLog(2, "ERROR, _dialpad: CreateOptionsMenu can't get reference to Menu"); return; }
    
    if (menuId.charAt(0) !== '#') { menuId = '#' + menuId; }
    
    j$(menuId).html('');
    
    var featureset = common.GetParameterInt('featureset', 10);
    
    var extramenuurl = common.GetParameter('extramenuurl');
    var extramenutxt = common.GetParameter('extramenutxt');
    if (!common.isNull(extramenuurl) && extramenuurl.length > 5 && !common.isNull(extramenutxt) && extramenutxt.length > 0)
    {
        j$(menuId).append( '<li id="' + MENUITEM_DIALPAD_EXTRA + '"><a data-rel="back">' + extramenutxt + '</a></li>' ).listview('refresh');
    }
    
    j$(menuId).append( '<li id="' + MENUITEM_DIALPAD_SETTINGS + '"><a data-rel="back">' + stringres.get('settings_title') + '</a></li>' ).listview('refresh');
        
    if ( featureset > 0 && !common.isNull(common.GetParameter('accounturi')) && common.GetParameter('accounturi').length > 3 )
    {
        j$(menuId).append( '<li id="' + MENUITEM_DIALPAD_MYACCOUNT + '"><a data-rel="back">' + stringres.get('myaccount') + '</a></li>' ).listview('refresh');
    }

    if ( featureset > 0 && !common.isNull(common.GetParameter('recharge')) && common.GetParameter('recharge').length > 3 )
    {
        j$(menuId).append( '<li id="' + MENUITEM_DIALPAD_RECHARGE + '"><a data-rel="back">' + stringres.get('recharge') + '</a></li>' ).listview('refresh');
    }
    
// handle hidesettings
    if (common.CanIUseVideo() === true)
    {
        j$(menuId).append( '<li id="' + MENUITEM_DIALPAD_VIDEOCALL + '"><a data-rel="back">' + stringres.get('video_call') + '</a></li>' ).listview('refresh');
    }
    
    if (common.HideSettings('conference', stringres.get('sett_display_name_' + 'conference'), 'conference', true) === false)
    {
        if ((common.GetConfigBool('usingmizuserver', false) === true || common.IsMizuWebRTCEmbeddedServer() === true || common.IsMizuWebRTCGateway() === true) &&
                common.IsWindowsSoftphone() === false && common.getuseengine() === global.ENGINE_WEBRTC)

        {
            var cfr = common.GetParameterInt('conferencerooms', 1);
            if (cfr > 0)
            {
                if (common.Glcf() === true)
                {
                    j$(menuId).append( '<li id="' + MENUITEM_DIALPAD_CONFERENCEROOMS + '"><a data-rel="back">' + stringres.get('menu_confrooms') + '</a></li>' ).listview('refresh');
                }
            }
        }
    }
    
    if (common.CanIUseScreensharing() === true)
    {
        j$(menuId).append( '<li id="' + MENUITEM_DIALPAD_SCREENSHARE + '"><a data-rel="back">' + stringres.get('menu_screenshare') + '</a></li>' ).listview('refresh');
    }
    
    if (common.GetConfigBool('hasfiletransfer', true) !== false && (common.GetConfigBool('usingmizuserver', false) === true || common.IsMizuWebRTCGateway() === true))
    {
        if (common.Glft() === true)
        {
            j$(menuId).append( '<li id="' + MENUITEM_DIALPAD_FILETRANSFER + '"><a data-rel="back">' + stringres.get('filetransf_title') + '</a></li>' ).listview('refresh');
        }
    }

    if ( featureset > 0 && !common.isNull(common.GetParameter('p2p')) && common.GetParameter('p2p').length > 3 )
    {
        j$(menuId).append( '<li id="' + MENUITEM_DIALPAD_P2P + '"><a data-rel="back">' + stringres.get('p2p') + '</a></li>' ).listview('refresh');
    }
    
    if ( featureset > 0)
    {
        if (common.GetParameter2('callback').length > 3 || common.GetConfig('callbacknumber').length > 3 || common.GetParameter2('callbacknumber').length > 3)
        {
            j$(menuId).append( '<li id="' + MENUITEM_DIALPAD_CALLBACK + '"><a data-rel="back">' + stringres.get('callback') + '</a></li>' ).listview('refresh');
        }
    }
    
    if (featureset > 0 && common.GetParameter('accessnumber').length > 1)
    {
        j$(menuId).append( '<li id="' + MENUITEM_DIALPAD_ACCESSNR + '"><a data-rel="back">' + stringres.get('menu_call_access') + '</a></li>' ).listview('refresh');
    }

    if ((common.getuseengine() === global.ENGINE_WEBRTC && (common.GetBrowser() === 'Firefox' || common.GetBrowser() === 'Chrome'))
            || global.audio_devices_loaded === true && (common.GetParameter('devicetype') === common.DEVICE_WIN_SOFTPHONE() || common.getuseengine() === global.ENGINE_SERVICE || common.getuseengine() === global.ENGINE_WEBPHONE))
    {
        if (common.GetConfigInt('brandid', -1) !== 50) // favafone
        {
            j$(menuId).append( '<li id="' + MENUITEM_DIALPAD_AUDIOSETTING + '"><a data-rel="back">' + stringres.get('audio_title') + '</a></li>' ).listview('refresh');
        }
    }
    
    
    
//--    if (featureset > 0 && common.GetParameterInt('voicemail', 2) === 2 && btn_isvoicemail === false)
//--    {
//--        j$(menuId).append( '<li id="' + MENUITEM_DIALPAD_VOICEMAIL + '"><a data-rel="back">' + stringres.get('voicemail_title') + '</a></li>' ).listview('refresh');
//--    }
    
    
// add custom menu items if any
    if (!common.isNull(global.custmenusL) && global.custmenusL.length > 0)
    {
        for (var i = 0; i < global.custmenusL.length; i++)
        {
            var cmid = 2000 + i;
            j$(menuId).append( '<li id="dialpad_custmenu_' + cmid + '"><a data-rel="back">' + global.custmenusL[i].label + '</a></li>' ).listview('refresh');
        }
    }
    
//--     Moved to HelpWindow
//--    var vcm = common.GetParameter2('webcallme');
//--    if (!common.isNull(vcm) && vcm.length === 1 && vcm !== '0')
//--    {
//--        j$(menuId).append( '<li id="' + MENUITEM_DIALPAD_WEBCALLME + '"><a data-rel="back">' + stringres.get('menu_webcallme') + '</a></li>' ).listview('refresh');
//--    }

//--    if (common.GetConfigInt('brandid', -1) === 60) // 101VOICEDT500
//--    {
//--        j$(menuId).append( '<li id="' + MENUITEM_DIALPAD_CALLPICKUP_101VOICE + '"><a data-rel="back">' + stringres.get('menu_callpickup') + '</a></li>' ).listview('refresh');
//--    }
    
//--    common.PutToDebugLog(4, 'EVENT, pv_1: ' + common.IsWindowsSoftphone() + '; pv_2: ' + common.GetConfig('needactivation') + '; pv_3: ' + common.CanShowLicKeyInput());
//--    if (common.IsWindowsSoftphone() && common.GetConfig('needactivation') == 'true' && common.CanShowLicKeyInput())
//--    {
//--        common.PutToDebugLog(4, 'EVENT, proversion_4: menu displayed');
//--        j$(menuId).append( '<li id="' + MENUITEM_DIALPAD_PROVERSION + '"><a data-rel="back">' + stringres.get('help_proversion') + '</a></li>' ).listview('refresh');
//--    }
    
//--    if (featureset > 0 && common.IsWindowsSoftphone() === true)
//--    {
//--        j$(menuId).append( '<li id="' + MENUITEM_DIALPAD_INTEGRATION + '"><a data-rel="back">' + stringres.get('menu_integration') + '...</a></li>' ).listview('refresh');
//--        j$(menuId).append( '<li id="' + MENUITEM_DIALPAD_FOLDERS + '"><a data-rel="back">' + stringres.get('menu_folders') + '...</a></li>' ).listview('refresh');
//--        j$("#" + MENUITEM_DIALPAD_INTEGRATION).attr("title", stringres.get("hint_integration"));
//--        j$("#" + MENUITEM_DIALPAD_FOLDERS).attr("title", stringres.get("hint_folders"));
//--    }
    
//--     Moved to HelpWindow
//--    j$(menuId).append( '<li id="' + MENUITEM_DIALPAD_RECONNECT + '"><a data-rel="back">' + stringres.get('menu_reconnect') + '</a></li>' ).listview('refresh');

   
    if (common.IsWindowsSoftphone())
    {
        j$(menuId).append( '<li id="' + MENUITEM_EXIT + '"><a data-rel="back">' + stringres.get('menu_exit') + '</a></li>' ).listview('refresh');
    }
    
    var help_title = stringres.get('menu_help') + '...';
//--    if (common.GetConfigInt('brandid', -1) === 60) { help_title = stringres.get('help_about'); } // 101VOICEDT500
    j$(menuId).append( '<li id="' + MENUITEM_HELP + '"><a data-rel="back">' + help_title + '</a></li>' ).listview('refresh');
    
//--    if ( featureset > 0 && !common.isNull(common.GetParameter('homepage')) && common.GetParameter('homepage').length > 3 )
//--    {
//--        j$(menuId).append( '<li id="' + MENUITEM_DIALPAD_PROVIDER + '"><a data-rel="back">' + stringres.get('myprovider') + '</a></li>' ).listview('refresh');
//--    }
    return true;
    
    } catch(err) { common.PutToDebugLogException(2, "_dialpad: CreateOptionsMenu", err); }
    
    return false;
}

function MenuItemSelected(itemid)
{
    try{
    if (common.isNull(itemid) || itemid.length < 1) { return; }
    
    // moved here, because my account can be openned in a new window so browser can't block popup
    if (itemid === MENUITEM_DIALPAD_MYACCOUNT)
    {
        MyAccount();
        return;
    }
    
    j$( '#dialpad_menu' ).on( 'popupafterclose', function( event )
    {
        j$( '#dialpad_menu' ).off( 'popupafterclose' );
        
        if (itemid.indexOf('dialpad_custmenu_') === 0) // means it's a custom menu
        {
            itemid = itemid.replace('dialpad_custmenu_', '');
            
            if (common.IsNumber(itemid))
            {
                var cmid = common.StrToInt(itemid);
                cmid = cmid - 2000;
                
                if (cmid >= 0)
                {
                    var action = global.custmenusL[cmid].action;
                    var data = global.custmenusL[cmid].data;
                    var label = global.custmenusL[cmid].label;
                    
                    common.PutToDebugLog(2, "EVENT, MenuItemSelected custom menu action: " + action + "; data: " + data);
    		
                    if (action.toLowerCase() === 'dial')
                    {
                        StartCall(data);
                    }
                    else if (action.toLowerCase() === 'link')
                    {
                        common.OpenWebURL(data, label);
                    }else
                    {
                        common.PutToDebugLog(1, "ERROR, Invalid Menu action: " + action);
                    }
                }
            }
            
        }

        switch (itemid)
        {
            case MENUITEM_DIALPAD_EXTRA:
                common.OpenWebURL( common.GetParameter('extramenuurl'), common.GetParameter('extramenutxt') );
                break;
            case MENUITEM_DIALPAD_SETTINGS:
                common.OpenSettings(true);
                break;
            case MENUITEM_DIALPAD_PROVIDER:
                common.OpenWebURL( common.GetParameter('homepage'), stringres.get('myprovider') );
                break;
            case MENUITEM_DIALPAD_P2P:
                common.Phone2Phone('', '');
                break;
            case MENUITEM_DIALPAD_CALLBACK:
                Callback();
                break;
            case MENUITEM_DIALPAD_RECHARGE:
                CreditRecharge();
                break;
            case MENUITEM_HELP:
                common.HelpWindow('dialpad');
                break;
            case MENUITEM_EXIT:
                common.Exit();
                break;
            case MENUITEM_DIALPAD_ACCESSNR:
                CallAccessNumber();
                break;
            case MENUITEM_DIALPAD_VOICEMAIL:
                MenuVoicemail();
                break;
            case MENUITEM_DIALPAD_FILETRANSFER:
                common.FileTransfer(j$('#phone_number').val());
                break;
            case MENUITEM_DIALPAD_PROVERSION:
                common.UpgradeToProVersion();
                break;
            case MENUITEM_DIALPAD_AUDIOSETTING:
                webphone_api.devicepopup();
                break;
//--            case MENUITEM_DIALPAD_RECONNECT:
//--                ReConnect();
//--                break;
//--            case MENUITEM_DIALPAD_WEBCALLME:
//--                GenerateWebcallmeLink();
//--                break;
            case MENUITEM_DIALPAD_CONFERENCEROOMS:
                common.CreateConferenceRoom(true);
                break;
            case MENUITEM_DIALPAD_VIDEOCALL:
                VideoCall('');
                break;
            case MENUITEM_DIALPAD_CALLPICKUP_101VOICE:
                StartCall('**', false);
                break;
            case MENUITEM_DIALPAD_SCREENSHARE:
                ScreenShare();
                break;
            case MENUITEM_DIALPAD_INTEGRATION:
                Integration();
                break;
            case MENUITEM_DIALPAD_FOLDERS:
                Folders();
                break;
        }
    });
    } catch(err) { common.PutToDebugLogException(2, "_dialpad: MenuItemSelected", err); }
}

function Integration(popupafterclose)
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

    var list = '';
    var item = '<li id="[ITEMID]"><a data-rel="back" title="[ITEMHINT]">[ITEMTITLE]</a></li>';

    var itemTemp = '';

    itemTemp = item.replace('[ITEMID]', '#item_integrate_outlook');
    itemTemp = itemTemp.replace('[ITEMTITLE]', stringres.get('menu_int_outlook'));
    itemTemp = itemTemp.replace('[ITEMHINT]', stringres.get('hint_int_outlook'));
    list = list + itemTemp;
    itemTemp = '';
    itemTemp = item.replace('[ITEMID]', '#item_integrate_chrome');
    itemTemp = itemTemp.replace('[ITEMTITLE]', stringres.get('menu_int_chrome'));
    itemTemp = itemTemp.replace('[ITEMHINT]', stringres.get('hint_int_chrome'));
    list = list + itemTemp;
    itemTemp = '';

    var template = '' +
'<div id="integration_window" data-role="popup" class="ui-content messagePopup" data-overlay-theme="a" data-theme="a" style="max-width:' + popupWidth + 'px; min-width: ' + Math.floor(popupWidth * 0.6) + 'px;">' +

    '<div data-role="header" data-theme="b">' +
        '<a href="javascript:;" data-role="button" data-icon="delete" data-iconpos="notext" class="ui-btn-right closePopup">Close</a>' +
        '<h1 class="adialog_title">' + stringres.get('menu_integration') + '</h1>' +
    '</div>' +
    '<div role="main" class="ui-content adialog_content" style="padding: 0; margin: 0;">' +

        '<ul id="integration_window_ul" data-role="listview" data-inset="true" data-icon="false" style="margin: 0;">' +
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

            j$('#integration_window_ul').off('click', 'li');

            popupafterclose();
        }
    });

    j$('#integration_window_ul').on('click', 'li', function(event)
    {
        var itemid = j$(this).attr('id');

        j$( '#integration_window' ).on( 'popupafterclose', function( event )
        {
            j$( '#integration_window' ).off( 'popupafterclose' );
            
            if (itemid === '#item_integrate_outlook')
            {
                common.PutToDebugLog(4, 'EVENT, _dialpad: Integration outlook clicked');

                var url = common.AddJscommport(global.WIN_SOFTPHONE_URL) + '?extcmd_integrate_outlook';
                common.WinSoftphoneHttpReq(url, 'GET', '', function (resp)
                {
                    common.PutToDebugLog(2, 'EVENT, Integration outlook answer: ' + resp);
                });
            }
            else if (itemid === '#item_integrate_chrome')
            {
                common.PutToDebugLog(4, 'EVENT, _dialpad: Integration chrome clicked');
                
                var url = common.AddJscommport(global.WIN_SOFTPHONE_URL) + '?extcmd_integrate_chorme';
                common.WinSoftphoneHttpReq(url, 'GET', '', function (resp)
                {
                    common.PutToDebugLog(2, 'EVENT, Integration chrome answer: ' + resp);
                });
            }
            else
            {
                common.PutToDebugLog(2, 'ERROR, _dialpad: Integration invalid item id: ' + itemid);
            }
        });
    });
    } catch(err) { common.PutToDebugLogException(2, "_dialpad: Integration", err); }
}

function Folders(popupafterclose)
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

    var list = '';
    var item = '<li id="[ITEMID]"><a data-rel="back" title="[ITEMHINT]">[ITEMTITLE]</a></li>';

    var itemTemp = '';

    itemTemp = item.replace('[ITEMID]', '#item_folders_bin');
    itemTemp = itemTemp.replace('[ITEMTITLE]', stringres.get('menu_folders_bin'));
    itemTemp = itemTemp.replace('[ITEMHINT]', stringres.get('hint_folders_bin'));
    list = list + itemTemp;
    itemTemp = '';
    itemTemp = item.replace('[ITEMID]', '#item_folders_data');
    itemTemp = itemTemp.replace('[ITEMTITLE]', stringres.get('menu_folders_data'));
    itemTemp = itemTemp.replace('[ITEMHINT]', stringres.get('hint_folders_data'));
    list = list + itemTemp;
    itemTemp = '';

    var template = '' +
'<div id="folders_window" data-role="popup" class="ui-content messagePopup" data-overlay-theme="a" data-theme="a" style="max-width:' + popupWidth + 'px; min-width: ' + Math.floor(popupWidth * 0.6) + 'px;">' +

    '<div data-role="header" data-theme="b">' +
        '<a href="javascript:;" data-role="button" data-icon="delete" data-iconpos="notext" class="ui-btn-right closePopup">Close</a>' +
        '<h1 class="adialog_title">' + stringres.get('menu_folders') + '</h1>' +
    '</div>' +
    '<div role="main" class="ui-content adialog_content" style="padding: 0; margin: 0;">' +

        '<ul id="folders_window_ul" data-role="listview" data-inset="true" data-icon="false" style="margin: 0;">' +
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

            j$('#folders_window_ul').off('click', 'li');

            popupafterclose();
        }
    });

    j$('#folders_window_ul').on('click', 'li', function(event)
    {
        var itemid = j$(this).attr('id');

        j$( '#folders_window' ).on( 'popupafterclose', function( event )
        {
            j$( '#folders_window' ).off( 'popupafterclose' );
            
            if (itemid === '#item_folders_bin')
            {
                common.PutToDebugLog(4, 'EVENT, _dialpad: folders BIN clicked');

                var url = common.AddJscommport(global.WIN_SOFTPHONE_URL) + '?extcmd_folder_bin';
                common.WinSoftphoneHttpReq(url, 'GET', '', function (resp)
                {
                    common.PutToDebugLog(2, 'EVENT, folders BIN answer: ' + resp);
                });
            }
            else if (itemid === '#item_folders_data')
            {
                common.PutToDebugLog(4, 'EVENT, _dialpad: folders DATA clicked');
                
                var url = common.AddJscommport(global.WIN_SOFTPHONE_URL) + '?extcmd_folder_data';
                common.WinSoftphoneHttpReq(url, 'GET', '', function (resp)
                {
                    common.PutToDebugLog(2, 'EVENT, folders DATA answer: ' + resp);
                });
            }
            else
            {
                common.PutToDebugLog(2, 'ERROR, _dialpad: folders invalid item id: ' + itemid);
            }
        });
    });
    } catch(err) { common.PutToDebugLogException(2, "_dialpad: Folders", err); }
}

// softphone -> my account -> open in a new window if our server / our webportal (path contains /mvweb)
function MyAccount()
{
    try{
    var uri = common.GetParameter('accounturi');
    if (common.IsMizuServer() === true || uri.indexOf('/mvweb') > 0) // open url in new window
    {
        uri = common.OpenWebURL( uri, '', false ); // replace keywords
        if (common.IsWindowsSoftphone() === true)
        {
            common_public.OpenLinkInExternalBrowser(uri);
        }else
        {
            window.open(uri);
        }
    }else
    {
        common.OpenWebURL( uri, stringres.get('myaccount') );
    }
    } catch(err) { common.PutToDebugLogException(2, "_dialpad: MyAccount", err); }
}

function ScreenShare(phoneNr) // initiate screenshare call if a number is entered in phone field, or request a number from the user
{
    try{
    var field = document.getElementById('phone_number');
    if ( common.isNull(field) ) { return; }
    var number = field.value;
    if (!common.isNull(number))
    {
        number = common.Trim(number);
        if (number.length > 0)
        {
            number = common.NormalizeNumber(number);
            common.PutToDebugLog(4, 'EVENT, _dialpad initiate screenshare call to: ' + number);
            webphone_api.screenshare(number);
            return;
        }
    }
    
    var popupWidth = common.GetDeviceWidth();
    if ( !common.isNull(popupWidth) && common.IsNumber(popupWidth) && popupWidth > 100 )
    {
        popupWidth = Math.floor(popupWidth / 1.2);
    }else
    {
        popupWidth = 220;
    }
    var btnimage = 'btn_add_contact_txt.png';
    
    var template = '' +
'<div id="adialog_screensharecall" data-role="popup" class="ui-content messagePopup" data-overlay-theme="a" data-theme="a" style="max-width:' + popupWidth + 'px;">' +

    '<div data-role="header" data-theme="b">' +
        '<a href="javascript:;" data-role="button" data-icon="delete" data-iconpos="notext" class="ui-btn-right closePopup">Close</a>' +
        '<h1 class="adialog_title">' + stringres.get('screenshare_call') + '</h1>' +
    '</div>' +
    '<div role="main" class="ui-content adialog_content adialog_btn_nexttoinput">' +
        '<span>' + stringres.get('phone_nr') + ':</span>' +
        '<div style="clear: both;"><!--//--></div>' +
        '<input type="text" id="screensharecall_input" name="screensharecall_input" data-theme="a" autocapitalize="off"/>' +
        '<button id="btn_pickct" class="btn_nexttoinput ui-btn ui-btn-corner-all ui-btn-b noshadow"><img src="' + common.GetElementSource() + 'images/' + btnimage + '"></button>' +
    '</div>' +
    '<div data-role="footer" data-theme="b" class="adialog_footer">' +
        '<a href="javascript:;" id="adialog_positive" class="ui-btn ui-corner-all ui-shadow ui-btn-inline ui-btn-b adialog_2button" data-rel="back" data-transition="flow">' + stringres.get('btn_sharescreen') + '</a>' +
        '<a href="javascript:;" id="adialog_negative" class="ui-btn ui-corner-all ui-shadow ui-btn-inline ui-btn-b adialog_2button" data-rel="back">' + stringres.get('btn_cancel') + '</a>' +
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
            j$('#adialog_positive').off('click');
            j$('#adialog_negative').off('click');
            j$('#btn_pickct').off('click');
            popupafterclose();
        }
    });
    
//-- listen for enter onclick, and click OK button
//-- no need for this, because it reloads the page
//--    j$( "#adialog_videocall" ).keypress(function( event )
//--    {
//--        if ( event.which === 13 )
//--        {
//--            event.preventDefault();
//--            j$("#adialog_positive").click();
//--        }else
//--        {
//--            return;
//--        }
//--    });

    var screensharecall = document.getElementById('screensharecall_input');
    if (!common.isNull(screensharecall))
    {
        if (!common.isNull(phoneNr) && phoneNr.length > 0) { screensharecall.value = phoneNr; }
        screensharecall.focus();
    } // setting cursor to text input
    
    j$('#adialog_positive').on('click', function (event)
    {
        j$( '#adialog_screensharecall' ).on( 'popupafterclose', function( event )
        {
            number = screensharecall.value;

            common.PutToDebugLog(5,"EVENT, _dialpad ScreenShare 1 ok: " + number);

            if (common.isNull(number) || (common.Trim(number)).length < 1)
            {
                return;
            }else
            {
                number = common.Trim(number);
            }

            number = common.NormalizeNumber(number);
            webphone_api.screenshare(number);
        });
    });

    j$('#adialog_negative').on('click', function (event)
    {
        ;
    });
    
    j$('#btn_pickct').on('click', function (event)
    {
        j$.mobile.activePage.find(".messagePopup").popup("close");

        j$( '#adialog_screensharecall' ).on( 'popupafterclose', function( event )
        {
            j$( '#adialog_screensharecall' ).off( 'popupafterclose' );

            common.PickContact(ScreenShare);
        });
    });
    
    } catch(err) { common.PutToDebugLogException(2, "_dialpad: ScreenShare", err); }
}


//--function ReConnect() // restart the engine
//--{
//--    try{
//-- !!! MUST USE API_ReStart for NS here
//--    global.authenticated_displayed = false;
//--    webphone_api.startInner();
//--    } catch(err) { common.PutToDebugLogException(2, "_dialpad: ReConnect", err); }
//--}

function CreditRecharge()
{
    try{
    var ruri = common.GetParameter('recharge');
//--    if (common.GetConfigInt('brandid', -1) === 50)
//--    {
//--        common_public.OpenLinkInInternalBrowser(ruri);
//--        return;
//--    }
        
    if ((common.Trim(ruri)).indexOf('*') !== 0) // if starts with * => httpapi ELSE link
    {
        common.OpenWebURL( ruri, stringres.get('recharge') );
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
'<div id="adialog_recharge" data-role="popup" class="ui-content messagePopup" data-overlay-theme="a" data-theme="a" style="max-width:' + popupWidth + 'px;">' +

    '<div data-role="header" data-theme="b">' +
        '<a href="javascript:;" data-role="button" data-icon="delete" data-iconpos="notext" class="ui-btn-right closePopup">Close</a>' +
        '<h1 class="adialog_title">' + stringres.get('recharge') + '</h1>' +
    '</div>' +
    '<div role="main" class="ui-content adialog_content">' +
        '<span>' + stringres.get('recharge_msg') + ':</span>' +
        '<input type="text" id="recharge_input" name="recharge_input" data-theme="a" autocapitalize="off"/>' +
    '</div>' +
    '<div data-role="footer" data-theme="b" class="adialog_footer">' +
        '<a href="javascript:;" id="adialog_positive" class="ui-btn ui-corner-all ui-shadow ui-btn-inline ui-btn-b adialog_2button" data-rel="back" data-transition="flow">' + stringres.get('btn_ok') + '</a>' +
        '<a href="javascript:;" id="adialog_negative" class="ui-btn ui-corner-all ui-shadow ui-btn-inline ui-btn-b adialog_2button" data-rel="back">' + stringres.get('btn_cancel') + '</a>' +
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
            j$('#adialog_positive').off('click');
            j$('#adialog_negative').off('click');
            popupafterclose();
        }
    });
    
//-- listen for enter onclick, and click OK button
//-- no need for this, because it reloads the page
//--    j$( "#adialog_recharge" ).keypress(function( event )
//--    {
//--        if ( event.which === 13 )
//--        {
//--            event.preventDefault();
//--            j$("#adialog_positive").click();
//--        }else
//--        {
//--            return;
//--        }
//--    });

    var recharge = document.getElementById('recharge_input');
    if (!common.isNull(recharge)) { recharge.focus(); } // setting cursor to text input
    
    j$('#adialog_positive').on('click', function (event)
    {
        common.PutToDebugLog(5,"EVENT, _dialpad CreditRecharge 1 ok");

        var pin = recharge.value;
        
        if (common.isNull(pin) || (common.Trim(pin)).length < 1)
        {
            common.ShowToast(stringres.get('recharge_error'));
            return;
        }else
        {
            pin = common.Trim(pin);
        }
        
        common.UriParser(common.GetParameter('recharge'), pin, '', '', '', 'recharge');
    });

    j$('#adialog_negative').on('click', function (event)
    {
        ;
    });
    
    } catch(err) { common.PutToDebugLogException(2, "_dialpad: CreditRecharge", err); }
}

function VideoCall(phoneNr) // initiate video call if a number is entered in phone field, or request a number from the user
{
    try{
    var field = document.getElementById('phone_number');
    if ( common.isNull(field) ) { return; }
    var number = field.value;
    if (!common.isNull(number))
    {
        number = common.Trim(number);
        if (number.length > 0)
        {
            StartCall(number, true);
            return;
        }
    }
    
    var lastDialed = common.GetParameter("redial");
    if (common.isNull(lastDialed)) { lastDialed = ''; }
    
    var popupWidth = common.GetDeviceWidth();
    if ( !common.isNull(popupWidth) && common.IsNumber(popupWidth) && popupWidth > 100 )
    {
        popupWidth = Math.floor(popupWidth / 1.2);
    }else
    {
        popupWidth = 220;
    }
    var btnimage = 'btn_add_contact_txt.png';
    
    var template = '' +
'<div id="adialog_videocall" data-role="popup" class="ui-content messagePopup" data-overlay-theme="a" data-theme="a" style="max-width:' + popupWidth + 'px;">' +

    '<div data-role="header" data-theme="b">' +
        '<a href="javascript:;" data-role="button" data-icon="delete" data-iconpos="notext" class="ui-btn-right closePopup">Close</a>' +
        '<h1 class="adialog_title">' + stringres.get('video_call') + '</h1>' +
    '</div>' +
    '<div role="main" class="ui-content adialog_content adialog_btn_nexttoinput">' +
        '<span>' + stringres.get('phone_nr') + ':</span>' +
        '<div style="clear: both;"><!--//--></div>' +
        '<input type="text" id="videocall_input" name="videocall_input" value="' + lastDialed + '" data-theme="a" autocapitalize="off"/>' +
        '<button id="btn_pickct" class="btn_nexttoinput ui-btn ui-btn-corner-all ui-btn-b noshadow"><img src="' + common.GetElementSource() + 'images/' + btnimage + '"></button>' +
    '</div>' +
    '<div data-role="footer" data-theme="b" class="adialog_footer">' +
        '<a href="javascript:;" id="adialog_positive" class="ui-btn ui-corner-all ui-shadow ui-btn-inline ui-btn-b adialog_2button" data-rel="back" data-transition="flow">' + stringres.get('btn_videocall') + '</a>' +
        '<a href="javascript:;" id="adialog_negative" class="ui-btn ui-corner-all ui-shadow ui-btn-inline ui-btn-b adialog_2button" data-rel="back">' + stringres.get('btn_cancel') + '</a>' +
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
            j$('#adialog_positive').off('click');
            j$('#adialog_negative').off('click');
            j$('#btn_pickct').off('click');
            popupafterclose();
        }
    });
    
//-- listen for enter onclick, and click OK button
//-- no need for this, because it reloads the page
//--    j$( "#adialog_videocall" ).keypress(function( event )
//--    {
//--        if ( event.which === 13 )
//--        {
//--            event.preventDefault();
//--            j$("#adialog_positive").click();
//--        }else
//--        {
//--            return;
//--        }
//--    });

    var videocall = document.getElementById('videocall_input');
    if (!common.isNull(videocall))
    {
        if (!common.isNull(phoneNr) && phoneNr.length > 0) { videocall.value = phoneNr; }
        videocall.focus();
    } // setting cursor to text input
    
    j$('#adialog_positive').on('click', function (event)
    {
        j$( '#adialog_videocall' ).on( 'popupafterclose', function( event )
        {
            number = videocall.value;

            common.PutToDebugLog(5,"EVENT, _dialpad VideoCall 1 ok: " + number);

            if (common.isNull(number) || (common.Trim(number)).length < 1)
            {
                return;
            }else
            {
                number = common.Trim(number);
            }
            common.SaveParameter("redial", number);
            webphone_api.videocall(number);
        });
    });

    j$('#adialog_negative').on('click', function (event)
    {
        ;
    });
    
    j$('#btn_pickct').on('click', function (event)
    {
        j$.mobile.activePage.find(".messagePopup").popup("close");

        j$( '#adialog_videocall' ).on( 'popupafterclose', function( event )
        {
            j$( '#adialog_videocall' ).off( 'popupafterclose' );

            common.PickContact(VideoCall);
        });
    });
    
    } catch(err) { common.PutToDebugLogException(2, "_dialpad: VideoCall", err); }
}

function MenuVoicemail()
{
    try{
    var vmNumber = common.GetParameter("voicemailnum");
//-- if mizu server or mizu upper server (don't check if mizu gateway), then auto set the voicemailnumber to 5001
    if ((common.isNull(vmNumber) || vmNumber.length < 1) && common.IsMizuServer() === true)
    {
        vmNumber = '5001';
        common.SaveParameter('voicemailnum', vmNumber);
    }

    if (!common.isNull(vmNumber) && vmNumber.length > 0)
    {
        StartCall(vmNumber);
    }else
    {
        SetVoiceMailNumber(function (vmnr)
        {
            if (!common.isNull(vmnr) && vmnr.length > 0) { StartCall(vmnr); }
        });
    }
    } catch(err) { common.PutToDebugLogException(2, "_dialpad: MenuVoicemail", err); }
}

function Callback() // Menu -> Callback
{
    try{
    var cburi = common.GetParameter2('callback');
    if (cburi.length < 3) { cburi = common.GetConfig('callback'); }

    var cbnr = common.GetParameter2('callbacknumber');
    if (cbnr.length < 3) { cbnr = common.GetConfig('callbacknumber'); }
    
// callback with http request uri
    if (!common.isNull(cburi) && cburi.length > 2)
    {
        var popupWidth = common.GetDeviceWidth();
        if ( !common.isNull(popupWidth) && common.IsNumber(popupWidth) && popupWidth > 100 )
        {
            popupWidth = Math.floor(popupWidth / 1.2);
        }else
        {
            popupWidth = 220;
        }

        var template = '' +
    '<div id="adialog_callback" data-role="popup" class="ui-content messagePopup" data-overlay-theme="a" data-theme="a" style="max-width:' + popupWidth + 'px;">' +

        '<div data-role="header" data-theme="b">' +
            '<a href="javascript:;" data-role="button" data-icon="delete" data-iconpos="notext" class="ui-btn-right closePopup">Close</a>' +
            '<h1 class="adialog_title">' + stringres.get('callback') + '</h1>' +
        '</div>' +
        '<div role="main" class="ui-content adialog_content">' +
            '<span>' + stringres.get('callback_src') + '</span>' +
            '<input type="text" id="callback_input" name="callback_input" data-theme="a" autocapitalize="off"/>' +
        '</div>' +
        '<div data-role="footer" data-theme="b" class="adialog_footer">' +
            '<a href="javascript:;" id="adialog_positive" class="ui-btn ui-corner-all ui-shadow ui-btn-inline ui-btn-b adialog_2button" data-rel="back" data-transition="flow">' + stringres.get('btn_ok') + '</a>' +
            '<a href="javascript:;" id="adialog_negative" class="ui-btn ui-corner-all ui-shadow ui-btn-inline ui-btn-b adialog_2button" data-rel="back">' + stringres.get('btn_cancel') + '</a>' +
        '</div>' +
    '</div>';

        var popupafterclose = function () {};

        j$.mobile.activePage.append(template).trigger("create");
//--        j$.mobile.activePage.append(template).trigger("pagecreate");

        j$.mobile.activePage.find(".closePopup").bind("tap", function (e)
        {
            j$.mobile.activePage.find(".messagePopup").popup("close");
        });

        j$.mobile.activePage.find(".messagePopup").popup().popup("open").bind(
        {
            popupafterclose: function ()
            {
                j$(this).unbind("popupafterclose").remove();
                j$('#adialog_positive').off('click');
                j$('#adialog_negative').off('click');
                popupafterclose();
            }
        });

//--     listen for enter onclick, and click OK button
//-- no need for this, because it reloads the page
//--        j$( "#adialog_callback" ).keypress(function( event )
//--        {
//--            if ( event.which === 13 )
//--            {
//--                event.preventDefault();
//--                j$("#adialog_positive").click();
//--            }else
//--            {
//--                return;
//--            }
//--        });

        var callback = document.getElementById('callback_input');
        if (!common.isNull(callback)) { callback.focus(); } // setting cursor to text input

        var lastCallbackNr = common.GetParameter('last_callback_nr');

        if (!common.isNull(lastCallbackNr) && lastCallbackNr.length > 0)
        {
            callback.value = lastCallbackNr;
        }

        j$('#adialog_positive').on('click', function (event)
        {
            common.PutToDebugLog(5,"EVENT, _dialpad Phone2Phone 1 ok");

            var callbacknr = callback.value;

            if (common.isNull(callbacknr) || (common.Trim(callbacknr)).length < 1)
            {
                common.ShowToast(stringres.get('callback_src'));
                return;
            }else
            {
                callbacknr = common.Trim(callbacknr);
            }

            common.UriParser(cburi, '', callbacknr, '', '', 'callback');
            common.SaveParameter('last_callback_nr', callbacknr);
        });

        j$('#adialog_negative').on('click', function (event)
        {
            ;
        });
    
        }else if (!common.isNull(cbnr) && cbnr.length > 2)
        {
            if (webphone_api.isregistered() === true)
            {
                StartCall(cbnr);
            }else
            {
                // on pc show sip:uri AND tel:uri, on mobile show only tel:uri
                var mob = '<a href="tel:' + cbnr + '">' + cbnr + '</a>';
                var sip = '<a href="sip:' + cbnr + '">' + cbnr + '</a>';
                
                var htmlcont = '';
                var os = common.GetOs(); // Windows, MacOS, Linux
                if (os === 'Windows' || os === 'MacOS' || os === 'Linux')
                {
                    htmlcont = stringres.get('cb_callonnative') + ': ' + sip + '<br /><br />' + stringres.get('cb_callonmobile') + ': ' + mob;
                }else
                {
                    htmlcont = stringres.get('cb_callonmobile') + ': ' + mob;
                }
                
                common.AlertDialog(stringres.get('callback'), htmlcont);
            }
        }else
        {
            common.PutToDebugLog(2, 'ERROR,_dialpad: Callback, cannot find callback method, number: ' + cbnr + '; uri: ' + cburi);
        }
        
    } catch(err) { common.PutToDebugLogException(2, "_dialpad: Callback", err); }
}

function CallAccessNumber()
{
    try{
//-- akos: accessnumber -> on mobile call with native dialer, on pc call on voip
    var nr = common.GetParameter('accessnumber');
    
    var os = common.GetOs(); // Windows, MacOS, Linux
    if (os === 'Windows' || os === 'MacOS' || os === 'Linux')
    {
        common.CallNumberProtocolHandler('sip', nr);
    }else
    {
        common.CallNumberProtocolHandler('tel', nr);
    }
    } catch(err) { common.PutToDebugLogException(2, "_dialpad: CallAccessNumber", err); }
}

function onStop(event)
{
    try{
    common.PutToDebugLog(4, "EVENT, _dialpad: onStop");
    global.isDialpadStarted = false;
    
    document.getElementById('phone_number').value = '';
    
    } catch(err) { common.PutToDebugLogException(2, "_dialpad: onStop", err); }
}

function onDestroy (event){} // deprecated by onstop

var dialpad_public = {

    PopulateListRecents: PopulateListRecents,
    HandleAutoaction: HandleAutoaction,
    MeasureDialPad: MeasureDialPad
};
window.dialpad_public = dialpad_public;

// public members and methods
return {
    onCreate: onCreate,
    onStart: onStart,
    onStop: onStop,
    onDestroy: onDestroy,
    PopulateListRecents: PopulateListRecents
};
})();