/* global common */

// settings page
//--define(['jquery', 'common', 'stringres', 'global', 'plhandler', 'file'], function($, common, stringres, global, plhandler, file)
wpa._settings = (function ()
{
var isSettLevelBasic = true; // basic / advanced settings display
var startedfrom = '';
var filtervisible = false; // means search filder is hidden

var currautoprovsrv = ''; //-- autoprovisioning -> if op code changed, then download autoprovisioning (block at start)
var chooseenginetouse = '';
    
function onCreate (event) // called only once - bind events here
{
    try{
    common.PutToDebugLog(4, "EVENT, _settings: onCreate");
    common.SetLanguage();


//--if (global.isdebugversionakos === true)
//--{
//--    j$('#testrate').show();
//--    j$('#testrate').on('click', function(event)
//--    {
//--        common.UriParser(common.GetParameter('ratingrequest'), '', '4072', '', '', 'getrating');
//--    });
//--}
    
// listen for enter onclick, and click OK button - working only for dialog boxes
    j$( "body" ).keypress(function( event )
    {
        if ( event.which === 13)
        {
            event.preventDefault();
            j$("#adialog_positive").click();
        }else
        {
            return;
        }
    });

// register global error listener: just for skin, NOT for SDK
    try{
        window.onerror = function (msg, url, lineNo, columnNo, error)
        {
            try{
                if (console)
                {
                    var emsg = 'GlobalErrorHandler' + msg + ' (' + error + ') url: ' + url + ' line: ' + lineNo + ' col: ' + columnNo;
                    if (console.error)
                    {
                        console.error(emsg);
                    }
                    else if (console.log)
                    {
                        console.log(emsg);
                    }

                    common.PutToDebugLog(2, 'ERROR, GlobalErrorHandler: ' + emsg);
                }
            } catch(errin2) { ; }
            return false;
        };
    } catch(errin1) { ; }


    j$('#settings_list').on('click', 'li', function(event)
    {
        OnListItemClick(j$(this).attr('id'));
    });
    
    j$( window ).resize(function() // window resize handling
    {
        if (j$.mobile.activePage.attr('id') === 'page_settings')
        {
            MeasureSettingslist();
        }
    });
    
    j$('#settings_menu_ul').on('click', 'li', function(event)
    {
        MenuItemSelected(j$(this).attr('id'));
    });
    
    common.SetLogFormAction();

    j$("#btn_settings_menu").on("click", function() { CreateOptionsMenu('#settings_menu_ul'); });
    j$("#btn_settings_menu").attr("title", stringres.get("hint_menu"));
    
    j$("#btn_back_settings").attr("title", stringres.get("hint_btnback"));

    j$("#btn_back_settings").on("click", function(event) { BackOnClick(event); });
    
    j$("#btn_settings_engine_close").on("click", function(event)
    {
        common.SaveParameter('ignoreengineselect', 'true');

        j$('#settings_engine').hide();
        j$('#dialpad_engine').hide();
        
        MeasureSettingslist();
    });
    
    j$("#a_newuser").on("click", function(event)
    {
        OnNewUserClicked();
        event.preventDefault();
    });

    j$("#a_forgotpassword").on("click", function(event)
    {
        if (common.IsWindowsSoftphone())
        {
            var forgotpasswordurl = common.GetConfig('forgotpasswordurl');
            if (!common.isNull(forgotpasswordurl) && forgotpasswordurl.length > 3)
            {
                common_public.OpenLinkInExternalBrowser(forgotpasswordurl);
                event.preventDefault();
            }
        }
    });
    j$('#lp_btn_custom').on("click", function(event) { CustomBtn(); });

// not used anymore (footer notification) !!!DEPRECATED
    j$("#btn_settings_engine").on("click", function(event)
    {
        common.SaveParameter('ignoreengineselect', 'true');

        j$('#settings_engine').hide();
        j$('#dialpad_engine').hide();
        
        if (common.isNull(chooseenginetouse) || chooseenginetouse.length < 1) { return; }
        MeasureSettingslist();
        
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
            common.ResetEngineClicked();
            var engine = GetEngine('app');
            engine.clicked = 2;
            SetEngine('app', engine);
        }
        
        var engine = common.GetEngine(chooseenginetouse);
        if (!common.isNull(engine))
        {
            engine.clicked = 2;
            common.SetEngine(chooseenginetouse, engine);
            
            
            common.ShowToast(common.GetEngineDisplayName(chooseenginetouse) + ' ' + stringres.get('ce_use'), function ()
            {
                common.ChooseEngineLogic2(chooseenginetouse);
                chooseenginetouse = '';
            });
        }
    });
    
    if (common.GetConfigInt('brandid', -1) === 58) // enikma
    {
        var logodiv = document.getElementById('logologinpage');
        if (!common.isNull(logodiv))
        {
            logodiv.innerHTML = '<img src="' + common.GetElementSource() + 'images/logo.png" style="border: 0;">&nbsp;&nbsp;<div style="color:#000; font-size: .6em; display: inline-block; position: relative; top: -0.6em;"><b>eNikMa</b> Unified Comm</div>';
        }
    }
    } catch(err) { common.PutToDebugLogException(2, "_settings: onCreate", err); }
}

function onStart(event)
{
    try{
//--setTimeout(function ()
//--{
//--    var message = 'For best experience: <a href="http://localhost:8383/_Webphone/native/WebPhoneService_Install.exe" target="_blank" id="adialog_nativeplugin">Install service plugin</a><br><br>';
//--    var callback = function (){};
//--    common_public.UserChooseEnginePopup(message, false, true, callback);
//--}, 500);

    common.SetCurrTheme();
    if (global.isdebugengine)
    {
        setTimeout(function ()
        {
            common_public.ChooseEngineLogic(function ()
            {
                alert('StartUp');
            }, false);
        },200);
    }
    
    ismodified = false;
    
    global.pagewasrefreshed = false;
    global.dploadingdisplayed = false;
    
    common.PutToDebugLog(4, "EVENT, _settings: onStart");
    
// content was hidden untill jquery mobile loaded. now dislpay content
    document.getElementById('phone_app_main_container').style.display = 'block';
    common.ShowModalLoader(stringres.get('loading'));
    common.PutToDebugLogSpecial(1, 'EVENT, _settings: onStart display Loading... modal loader_1', false, '');
    
    global.apppletloaded = false;
        
//--     API_GuiStarted()  when skin is loaded
//--    if (common.GetParameter('devicetype') === common.DEVICE_WIN_SOFTPHONE())
    if (common.IsWindowsSoftphone())
    {
        common.WinAPI('API_GuiStarted', function (answer)
        {
            common.PutToDebugLog(2, 'EVENT, _settings API_GuiStarted response: ' + answer);
        });
    }
    
    global.isSettingsStarted = true;
    
    j$("#settings_list").prev("form.ui-filterable").hide();
    
//--    if ( !common.isNull(document.getElementById('app_name_settings')) )
//--    {
//--        document.getElementById("app_name_settings").innerHTML = common.GetBrandName();
//--    }

    if ( !common.isNull(document.getElementById('settings_page_title')) ) { document.getElementById("settings_page_title").innerHTML = stringres.get("settings_title"); }
    j$("#settings_page_title").attr("title", stringres.get("hint_page"));

    j$(".separator_line_thick").css( 'background-color', common.HoverCalc(common.getBgColor('#settings_header'), -30) );

    // fix for IE 10
    if (common.IsIeVersion(10)) { j$("#settings_list").children().css('line-height', 'normal'); }


//-- setting should always show basic settings by default (no remember old advanced)
//--    if (common.GetParameter('settlevelbasic') === 'false')
//--    {
//--        isSettLevelBasic = false;
//--    }else
//--    {
//--        isSettLevelBasic = true;
//--    }

    j$('#settings_page_title').html(stringres.get('settings_login'));
    
    startedfrom = common.GetIntentParam(global.intentsettings, 'startedfrom');
    if (common.isNull(startedfrom)) { startedfrom = ''; }

    if (startedfrom === 'app')
    {
        j$('#app_name_settings').hide();
        j$('#btn_back_settings').show();
        j$('#btn_back_settings').html( '<b>&LT;</b>&nbsp;' + stringres.get("btn_cancel") );
    }else
    {
        j$('#btn_back_settings').hide();
        j$('#app_name_settings').show();
    }


// login page with username and password

//--    if (common.GetConfig('customizedversion') === 'true' && startedfrom !== 'app')
    if (ShowLoginPage())
    {
        j$('#settings_list').hide();
        j$('#loginpage_container').show();
        
        if (currfeatureset < 1) // minimal
        {
            j$('#btn_settings_menu').hide();
        }

        if (!common.IsWindowsSoftphone() && global.usestorage === true)
        {
//--            var cp = '<a href="http://www.mizu-voip.com/Software/WebPhone.aspx" target="_blank" title="Provider">Powered by Mizutech WebPhone &reg;</a>';
//--            j$("#settings_copyright").html(cp);
            j$("#settings_copyright").show();
        }

        var newuseruri = common.GetConfig('newuser');
        if (common.GetConfigInt('brandid', -1) === 50) // favafone
        {
            j$('#a_newuser').hide();
            
            j$('#lp_btn_custom').html(stringres.get('favafone_new'));
            j$('#lp_btn_custom').show();
            
        }else
        {
            if (!common.isNull(newuseruri) && newuseruri.length > 3)
            {
                j$('#a_newuser').show();
                j$('#a_newuser').html(stringres.get('newuser_a'));
                j$('#a_newuser').attr('href', newuseruri);
            }else
            {
                j$('#a_newuser').hide();
            }
        }
        
        var forgotpasswordurl = common.GetConfig('forgotpasswordurl');
        if (!common.isNull(forgotpasswordurl) && forgotpasswordurl.length > 3)
        {
            j$('#a_forgotpassword').show();
            j$('#a_forgotpassword').html(stringres.get('forgotpassword_a'));
            j$('#a_forgotpassword').attr('href', forgotpasswordurl);
        }else
        {
            j$('#a_forgotpassword').hide();
        }
    }else
    {
        j$('#loginpage_container').hide();
        j$('#settings_list').show();
        j$('#btn_settings_menu').show();
    }
    
    MeasureSettingslist();

    var trigerred = false; // handle multiple clicks
    j$("#lp_btn_login").on("click", function()
    {
        if (trigerred) { return; }
    
        trigerred = true;
        setTimeout(function ()
        {
            trigerred = false;
        }, 1000);
        
        var srv_field = document.getElementById("lp_serveraddress");
        
        if (!common.isNull(srv_field) && j$('#lp_serveraddress').closest( 'div.ui-input-text' ).is(':visible') == true)
        {
            var lpsrv = srv_field.value;
            if (common.isNull(lpsrv)) { lpsrv = ''; }
            lpsrv = common.Trim(lpsrv);
            lpsrv = lpsrv.toLowerCase();
            common.NormalizeInput(lpsrv, 0);
            
            common.SaveParameter('serveraddress_user', lpsrv);
        }
        
        if (!common.isNull(document.getElementById("lp_username")))
        {
            var lpusr = document.getElementById("lp_username").value;
            if (common.isNull(lpusr)) { lpusr = ''; }
            lpusr = common.Trim(lpusr);
            
            common.SaveParameter('sipusername', lpusr);
        }
    
        if (!common.isNull(document.getElementById("lp_password")))
        {
            var lppwd = document.getElementById("lp_password").value;
            if (common.isNull(lppwd)) { lppwd = ''; }
            lppwd = common.Trim(lppwd);
            
            common.SaveParameter('password', lppwd);
        }
    
        SaveSettings(true);
    });
    
    j$('#lp_serveraddress').closest( 'div.ui-input-text' ).hide();

    if (!common.isNull(document.getElementById("lp_serveraddress")))
    {
        document.getElementById("lp_serveraddress").placeholder = stringres.get('sett_display_name_serveraddress_user');
    }
    if (!common.isNull(document.getElementById("lp_username")))
    {
        document.getElementById("lp_username").placeholder = stringres.get('sett_display_name_sipusername');
    }
    if (!common.isNull(document.getElementById("lp_password")))
    {
        document.getElementById("lp_password").placeholder = stringres.get('sett_display_name_password');
    }

    var logo = common.GetConfig('logo');
    var logodiv = document.getElementById('logo');
    if (!common.isNull(logo) && logo.length > 2 && !common.isNull(logodiv))
    {
        var isimg = false;
        if ((logo.toLowerCase()).indexOf('.jpg') > 0 || (logo.toLowerCase()).indexOf('.jpeg') > 0
                || (logo.toLowerCase()).indexOf('.png') > 0 || (logo.toLowerCase()).indexOf('.gif') > 0)
        {
            isimg = true;
        }
        
        if (isimg)
        {
            logodiv.innerHTML = '<img src="' + common.GetElementSource() + 'images/' + logo + '" style="border: 0;">';
        }else
        {
            logodiv.innerHTML = '<span>' + logo + '</span>';
        }
    }
// END login page with username and password
    // needed for proper display and scrolling of listview
    MeasureSettingslist();

    accountsavailable = false;
    GetAccounts();
    
    setTimeout(function ()
    {
        if (common.IsSDK() === false && common.Glv() > 1 && common.GetParameter('androidchromedisplayed') !== 'true')
        {
            common.SaveParameter('androidchromedisplayed', 'true');
            
            if (common.GetOs() === 'Android'/* && common.GetBrowser() === 'Chrome'*/)
            {
                var ep_webrtc = common.StrToInt(common.GetParameter2('enginepriority_webrtc'));
                var ep_app = common.StrToInt(common.GetParameter2('enginepriority_app'));
                
                var usewebrtc = common.CanIUseWebRTC();
                if (ep_app < 1 || ep_webrtc < 2 || (ep_webrtc >= ep_app && usewebrtc === true)) { return; }
                
            // find and close all active popups before displaying OfferNativeEngine popup
                var active_popups = j$.mobile.activePage.find(".messagePopup");
                if (!common.isNull(active_popups) && active_popups.length > 0 && global.dontclosecurrpopup !== true)
                {
                    j$.mobile.activePage.find(".messagePopup").popup("close").bind(
                    {
                        popupafterclose: function ()
                        {
                            j$(this).unbind("popupafterclose").remove();
                            OfferNativeEngine();
                        }
                    });
                }else
                {
                    OfferNativeEngine();
                }
            }
        }
    }, 3000);
    
    if (common.GetConfigInt('brandid', -1) === 50 && global.favafone_autologin === true) // favafone
    {
        SaveSettings();
    }

    } catch(err) { common.PutToDebugLogException(2, "_settings: onStart", err); }
}

//--android-on ha softphone es chrome -> akkor elso indulasnal megkerdezni valasszon engine-t (ha nincs letiltva egyik engine sem):
//--         - recommended: native dialer with better quality or...
//--	 - ignore and start in web browser (webrtc) right now
function OfferNativeEngine(popupafterclose)
{
    try{
    if (common.GetParameter2('enginepriority_webrtc') === '0' || common.GetParameter2('enginepriority_app') === '0') { return; }
    
    var popupWidth = common.GetDeviceWidth();
    if ( !common.isNull(popupWidth) && common.IsNumber(popupWidth) && popupWidth > 100 )
    {
        popupWidth = Math.floor(popupWidth / 1.2);
    }else
    {
        popupWidth = 220;
    }
    
    var message = '<a href="javascript:;" id="pusenative">' + stringres.get('usenative_option_native') + '</a><br /><br />';
    message = message + '<a href="javascript:;" id="pusewebrtc">' + stringres.get('usenative_option_webrtc') + '</a>';
    
    var template = '' +
'<div data-role="popup" class="ui-content messagePopup" data-overlay-theme="a" data-theme="a" style="max-width:' + popupWidth + 'px;">' +

    '<div data-role="header" data-theme="b">' +
//--        '<a href="javascript:;" data-role="button" data-icon="delete" data-iconpos="notext" class="ui-btn-right closePopup">Close</a>' +
        '<h1 class="adialog_title">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + stringres.get('usenative_title') + '</h1>' +
    '</div>' +
    '<div role="main" class="ui-content adialog_content adialog_alert">' +
        '<span style="-ms-user-select: text; -moz-user-select: text; -khtml-user-select: text; -webkit-user-select: text;  user-select: text;"> ' + message + ' </span>' +
//        '<a href="javascript:;" class="ui-btn ui-corner-all ui-shadow ui-btn-inline ui-btn-b" data-rel="back">' + stringres.get('btn_close') + '</a>' +
//        '<a href="javascript:;" class="ui-btn ui-corner-all ui-shadow ui-btn-inline ui-btn-b" data-rel="back" data-transition="flow">Delete</a>' +
    '</div>' +
//--    '<div data-role="footer" data-theme="b" class="adialog_footer">' +
//--        '<a href="javascript:;" style="width: 98%;" class="ui-btn ui-corner-all ui-shadow ui-btn-inline ui-btn-b adialog_2button" data-rel="back" data-transition="flow">' + stringres.get('btn_close') + '</a>' +
//--    '</div>' +
'</div>';
 
    popupafterclose = popupafterclose ? popupafterclose : function () {};

    j$.mobile.activePage.append(template).trigger("create");
//--    j$.mobile.activePage.append(template).trigger("pagecreate");
//--    j$.mobile.activePage.find(".closePopup").bind("tap", function (e)
//--    {
//--        j$.mobile.activePage.find(".messagePopup").popup("close");
//--    });
    
    
    j$.mobile.activePage.find(".messagePopup").bind(
    {
        popupbeforeposition: function()
        {
            j$(this).unbind("popupbeforeposition");//--.remove();
            j$('.ui-popup-screen').off(); // Prevent JQuery Mobile from closing a popup when user taps outside of it

            var maxHeight =  Math.floor( common.GetDeviceHeight() * 0.6 );  //-- j$(window).height() - 120;

            if (j$(this).height() > maxHeight + 100)
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
            popupafterclose();
        }
    });
    
    j$("#pusewebrtc").on("click", function () //-- !!! also set in UserChooseEnginePopupSDK()
    {
        webphone_api.flagrestartwebrtc = true;
        j$.mobile.activePage.find(".messagePopup").popup( "close" );

        common.ResetEngineClicked();
        var engine = common.GetEngine('webrtc');
        engine.clicked = 2;
        common.SetEngine('webrtc', engine);
        
        common.EngineSelect(1);
    });
    
    j$("#pusenative").on("click", function () //-- !!! also set in UserChooseEnginePopupSDK()
    {
        webphone_api.flagrestartwebrtc = false;
        j$.mobile.activePage.find(".messagePopup").popup( "close" );

        common.ResetEngineClicked();
        var engine = common.GetEngine('app');
        engine.clicked = 2;
        common.SetEngine('app', engine);
        
        common.UploadAutoprov();

        common.HandleProtocol(common.GetConfig('app_protocol'));
    });
    
    } catch(err) { common.PutToDebugLogException(2, "_settings: OfferNativeEngine", err); }
}

function MeasureSettingslist() // resolve window height size change
{
    try{
//--    var pgh = common.GetDeviceHeight() - 1; j$('#page_settings').css('min-height', pgh + 'px'); // must be set when softphone is skin in div
    j$('#page_settings').css('min-height', 'auto'); // must be set when softphone is skin in div


    var pageheight = common.GetDeviceHeight() - j$("#settings_header").height() - 3;

    if (filtervisible)
    {
        var margin = common.StrToIntPx( j$(".ui-input-search").css("margin-top") );
        pageheight = pageheight - j$("#settings_list").prev("form.ui-filterable").height() - margin - margin;
    }
    
    if (j$('#settings_engine').is(':visible'))
    {
        pageheight = pageheight - j$("#settings_engine").height() - 2;
    }
    
    if (j$('#settings_copyright').is(':visible'))
    {
        var margin = common.StrToIntPx( j$("#settings_copyright").css("margin-bottom") );
        pageheight = pageheight - j$("#settings_copyright").height() - margin;
    }
    
    j$("#settings_list").height(pageheight);
    j$("#loginpage_container").height(pageheight);
    
    if (j$('#loginpage').is(':visible'))
    {
        var matop = pageheight - j$('#loginpage').height();
        matop = Math.floor(matop/2);
        j$('#loginpage').css('margin-top', matop + 'px');
    }
    
//--    if (j$('#settings_footer').is(':visible'))
//--    {
//--// set width
//--        var padding_close_str = j$("#btn_settings_engine_close").css('padding-left');
//--        var padding_close_int = 0;
//--        if (!common.isNull(padding_close_str) && padding_close_str.length > 0) { padding_close_int = common.StrToIntPx(padding_close_str); }
//--        padding_close_int = padding_close_int + 1;
        
//--        var btn_width = j$("#settings_footer").width() - j$("#btn_settings_engine_close").width() - (2 * padding_close_int);
//--        btn_width = Math.floor(btn_width);
        
//--        j$("#btn_settings_engine").width(btn_width - 3);

//--// set height
//--        var padding_top_str = j$("#btn_settings_engine_close").css('padding-top');
//--        var padding_bottom_str = j$("#btn_settings_engine_close").css('padding-bottom');
//--        var padding_top_int = 0;
//--        var padding_bottom_int = 0;
        
//--        if (!common.isNull(padding_top_str) && padding_top_str.length > 0) { padding_top_int = common.StrToIntPx(padding_top_str); }
//--        if (!common.isNull(padding_bottom_str) && padding_bottom_str.length > 0) { padding_bottom_int = common.StrToIntPx(padding_bottom_str); }
        
//--        var btn_height = j$("#btn_settings_engine_close").height() + padding_top_int + padding_bottom_int;
//--        j$("#btn_settings_engine").height(btn_height);
//--    }
    
    var brandW = Math.floor(common.GetDeviceWidth() / 4.6);
    j$("#app_name_settings").width(brandW);
        
    } catch(err) { common.PutToDebugLogException(2, "_settings: MeasureSettingslist", err); }
}

var accountsavailable = false; // true, if there is at least one account created. If "false". means we have to add an account at SaveSettings()
var filewaittimer = null; // we have to wait for File class to load
var waitmaxloop = 0;
function GetAccounts()
{
//--DBG     common.PutToDebugLog(3, 'DEBUG, _settings GetAccounts called');
    try{
// we have to wait for File class to load
    if (waitmaxloop > 18)
    {
        PutToDebugLog(1, 'ERROR, Failed to start');
        PutToDebugLog(2, 'ERROR, _settings GetAccounts File class failed to load');
    }
    if (common.isNull(global.File) && waitmaxloop < 20)
    {
        waitmaxloop++;
        filewaittimer = setTimeout(function ()
        {
            GetAccounts();
        }, 200);
        return;
    }
    
    if (!common.isNull(filewaittimer)) { clearTimeout(filewaittimer); }
    filewaittimer = null;
    
// continue, if we have file class
    
    if ( common.isNull(global.aclist) || (global.aclist).length < 1 )
    {
//--DBG         common.PutToDebugLog(3, 'DEBUG, _settings readaccounts');
        common.ReadAccountsFile(function (accisread)
        {
//--DBG             common.PutToDebugLog(3, 'DEBUG, _settings GetAccounts callback');
            // if there is no accounts file, means there are no settings either
            if (!accisread)
            {
//--DBG                 common.PutToDebugLog(3, 'DEBUG, _settings GetAccounts callback no content_1');
//--###AKOSSETT                common.InitializeSettings();
//--DBG                 common.PutToDebugLog(3, 'DEBUG, _settings GetAccounts callback no content_2');
//--###AKOSSETT                common.GetSettingsFromUrl();
//--###AKOSSETT                common.GetOverWriteSettings();
                common.HandleSettings('', '', function () { ; });
                wpskininit_public.SkinLoaded();

//--DBG                 common.PutToDebugLog(3, 'DEBUG, _settings GetAccounts callback no content_3');
                AutoStart();
//--DBG                 common.PutToDebugLog(3, 'DEBUG, _settings GetAccounts callback no content_4');
            }
            else // if we have accounts file, then we need to get settings filename and read setttings from file
            {
//--DBG                 common.PutToDebugLog(3, 'DEBUG, _settings GetAccounts callback read successfull');
                if (!common.isNull(common.settmap))
                {
                    for (var key in common.settmap)
                    {
                        delete common.settmap[key];
                    }
                }
                if (!common.isNull(common.settmap2))
                {
                    for (var key in common.settmap2)
                    {
                        delete common.settmap2[key];
                    }
                }
                
                accountsavailable = true;
                GetSettings();
            }
        });
    }else // if we have accounts file, then read 
    {
//--DBG         common.PutToDebugLog(3, 'DEBUG, _settings GetAccounts aclist exists');
        accountsavailable = true;
        GetSettings();
    }
    } catch(err) { common.PutToDebugLogException(2, "_settings: GetAccounts", err); }
}

function GetSettings()
{//--DBG common.PutToDebugLog(3, 'DEBUG, _settings GetSettings called');
    try{
//--    for (var key in common.settmap)
//--    {
//--        common.PutToDebugLog(2, 'SETT: ' + key + ' = ' + common.settmap[key]);
//--    }

    if ( common.isNull(common.settmap) || common.isNull( common.settmap['magicnumber'] ) )
    {
        var settfilename = common.GetActiveAccSettingsFilename();
        
//--DBG         common.PutToDebugLog(3, 'DEBUG, _settings GetSettings settfilename: ' + settfilename);

        if (common.isNull(settfilename) || settfilename.length < 2)
        {
//--DBG             common.PutToDebugLog(3, 'DEBUG, _settings GetSettings InitializeSettings called');
//--###AKOSSETT            common.InitializeSettings();
                common.HandleSettings('', '', function () { ; });
                wpskininit_public.SkinLoaded();
        }
        else // we got the active account settings filename, we can read settings
        {
//--DBG             common.PutToDebugLog(3, 'DEBUG, _settings GetSettings ReadSettingsFile');
            common.ReadSettingsFile(settfilename, function (settisread)
            {
//--DBG                 common.PutToDebugLog(3, 'DEBUG, _settings GetSettings callback');
                if (!settisread)
                {
//--DBG                     common.PutToDebugLog(3, 'DEBUG, _settings GetSettings ReadSettings no content');
//--###AKOSSETT                    common.InitializeSettings();
                }
                
                wpskininit_public.SkinLoaded();
                
//--###AKOSSETT                common.GetSettingsFromUrl();
//--###AKOSSETT                common.GetOverWriteSettings();
                AutoStart();
            });
        }
    }else
    {
//--DBG         common.PutToDebugLog(3, 'DEBUG, _settings GetSettings settmap exists');
        
//--###AKOSSETT        common.GetSettingsFromUrl();
//--###AKOSSETT        common.GetOverWriteSettings();
        AutoStart();
    }
    } catch(err) { common.PutToDebugLogException(2, "_settings: GetSettings", err); }
}

var changePageCalled = false; //-- cahangePage gets called serveral times, bu we need to avoid this
function AutoStart() //if server, username and password is set, then auto start (don't show the settings)
{//--DBG common.PutToDebugLog(3, 'DEBUG, _settings AutoStart called');
    try{
    if (startedfrom !== 'app')
    {
        var autologin = false;

        var srvTemp = common.GetParameter('serveraddress_user');
        var upperSrvTemp = common.GetParameter('upperserver');
        var usrTemp = common.GetParameter('sipusername');
        var pwdTemp = common.GetParameter('password');

        if (common.GetParameter('serverinputisupperserver') === 'true')
        {
            if (!common.isNull(upperSrvTemp) && upperSrvTemp.length > 2 && !common.isNull(usrTemp) && usrTemp.length > 2
                && !common.isNull(pwdTemp) && pwdTemp.length > 2)
            {
                autologin = true;
            }
        }
        else if (common.GetParameterBool('customizedversion', true) === true)
        {
            if (!common.isNull(usrTemp) && usrTemp.length > 2 && !common.isNull(pwdTemp) && pwdTemp.length > 2)
            {
                autologin =  true;
            }
        }else
        {
            if (!common.isNull(srvTemp) && srvTemp.length > 2 && !common.isNull(usrTemp) && usrTemp.length > 2
                && !common.isNull(pwdTemp) && pwdTemp.length > 2)
            {
                autologin = true;
            }
        }
        
//--     API_GuiStarted()  when skin is loaded
        if (common.IsWindowsSoftphone())
        {
            common.WinAPI('API_GuiStarted', function (answer)
            {
                common.PutToDebugLog(2, 'EVENT, _settings API_GuiStarted response: ' + answer);
            });
        }
        
        common.PutToDebugLog(2, 'EVENT, _settings before StartWin');
        
        var autostart = common.GetAutostart();
        
        if (autostart === false)
        {
            common.PutToDebugLog(3, 'EVENT, settings autologin disabled because autostart is FALSE');
            autologin = false;
        }
        
        if (common.GetParameterInt('lastsucc', -1) === 0 && common.IsSDK() === false) // only for skin
        {
            autologin = false;
            common.PutToDebugLog(2, 'WARNING,_settings AutoStart disabled, because last login was not successfull');
        }
        
        if (autologin)
        {
// content was hidden untill jquery mobile loaded. now dislpay content
            document.getElementById('phone_app_main_container').style.display = 'block';
            common.ShowModalLoader(stringres.get('loading'));
            common.PutToDebugLogSpecial(1, 'EVENT, _settings: onStart display Loading... modal loader_2', false, '');

    // cahangePage gets called serveral times, bu we need to avoid this
            if (changePageCalled)
            {
                return;
            }
            changePageCalled = true;
            setTimeout(function () // reset to defualt value
            {
                changePageCalled = false;
            }, 1000);


            j$.mobile.changePage("#page_dialpad", { transition: "pop", role: "page" });

            if (common.IsWindowsSoftphone())
            {
                setTimeout(function ()
                {
                    webphone_public.webphone_started = false;
//--                    webphone_public.StartWin();
                    
                    webphone_api.startInner( common.GetParameter('sipusername'), common.GetParameter('password') );
                }, 100);
            }else
            {
                setTimeout(function ()
                {
//--                    StartWithEngineSelect();
                    
                    webphone_api.startInner( common.GetParameter('sipusername'), common.GetParameter('password') );
                }, 150);
            }
            
            setTimeout(function ()
            {
                if (common.UsePresence2() === true)
                {
                    common.SetSelectedPresence('Offline', false);
                }
            }, 1000);
            
            if (common.GetConfigInt('brandid', -1) === global.BRAND_KOKOTALK)
            {
                setTimeout(function ()
                {
                    common.KokotalkGetToken();
                }, 4000);
            }

            return;
        }else
        {
            PopulateList();
        }
    }else
    {
        common.HideModalLoader();
        
        currautoprovsrv = common.GetParameter('serveraddress_user');

        PopulateList();
    }

    } catch(err) { common.PutToDebugLogException(2, "_settings: AutoStart", err); }
}

var eselect_called = false; //-- don't call EngineSelect() every time we PopulateList()
function EngineSelectStage1() //-- call EngineSelect(stage  1) before login, if we are staying on settings page
{
    try{
    if (common.IsWindowsSoftphone()) { return; }
    if (eselect_called) { return; }

    eselect_called = true;
    if (global.engineselectstage !== 0 || (common.GetTickCount() - global.engineselecttime) > global.ENGINE_DELAY || global.webrtcavailable < 0)
    {
        WaitForEngineSelectSetting();
    }else
    {
//--        wait for at least 1 second after EngineSelect stage 0 was called
        var wait = global.ENGINE_DELAY - (common.GetTickCount() - global.engineselecttime);
        if (wait < 0)
        {
            wait = 1;
        }

        setTimeout(function ()
        {
            WaitForEngineSelectSetting();
        }, wait);
    }
    } catch(err) { common.PutToDebugLogException(2, "_settings: EngineSelectStage1", err); }
}

var engineSelectTimer = null;
var limitmaxloop = 0;
function WaitForEngineSelectSetting()
{
    try{
    if (!common.isNull(engineSelectTimer))
    {
        clearInterval(engineSelectTimer);
        engineSelectTimer = null;
    }
    
    engineSelectTimer = setInterval(function ()
    {
        limitmaxloop++;
        
        if (limitmaxloop > 50)
        {
            common.PutToDebugLog(2, 'ERROR, _settings: EngineSelect timeout');
            clearInterval(engineSelectTimer);
        }
        
//--         wait at least 1 sec before calling with stage 1
        if ((common.GetTickCount() - global.engineselecttime) > global.ENGINE_DELAY)
        {
            var ret = common.EngineSelect(1);

            if (ret < 1 || global.webrtcavailable < 0)
            {
                if (ret < 1)
                {
                    common.PutToDebugLog(2, 'EVENT, _settings: waiting for EngineSelect (' + limitmaxloop + ')');
                }
                if (global.webrtcavailable < 0)
                {
                    common.PutToDebugLog(2, 'EVENT, _settings: waiting for WebRTC to load (' + limitmaxloop + ')');
                }
            }else
            {
                clearInterval(engineSelectTimer);

                common.PutToDebugLog(2, 'EVENT, _settings: selected engine(' + global.engineselectstage + '): '  + common.TestEngineToString(common.GetSelectedEngine(), false));
                common.PutToDebugLog(2, 'EVENT, _settings: recommended engine(' + global.engineselectstage + '): ' + common.TestEngineToString(common.GetRecommendedEngine(), false));

//--     handle push level, choose engine notification, but NOT popup
//--     display option to select engine, but don't display aggressive popup, when user must install (only after login)

                if (common.getuseengine() === global.ENGINE_WEBRTC || common.GetSelectedEngineName() === global.ENGINE_WEBRTC)
                {
                    common.TLSReload();
                }

                ShowEngineOptionSettings();
            }
        }
        
    }, 200);
    
    } catch(err) { common.PutToDebugLogException(2, "settings: WaitForEngineSelectSetting", err); }
}

var html_engineoption = ''; // stores engine option html element
function ShowEngineOptionSettings(force_show)
{
    try{
    var selengine = common.GetSelectedEngineName();
    var recengine = common.GetRecommendedEngineName();
    
    if (common.isNull(selengine) || selengine.length < 1)
    {
//--        common.PutToDebugLog(2, 'ERROR, _settings: ShowEngineOptionSettings no selected engine available');
        return false;
    }

// means this is the firts start, we have to use selected engine
    if (common.isNull(global.useengine) || global.useengine.length < 2)
    {
//--        force engine start, in case of IE, if engine is Java (otherwise it will not start any engine, if Close button is pressed)
//--         hack for IsJavaInstalled for IE, because we can't detect it properly, so we start the java engine, and fall back if it's not working
        if (common.GetSelectedEngineName() === 'java' && common.GetBrowser() === 'MSIE' && common.IsJavaInstalled() < 2)
        {
            ;//-- don't set global.useengine, because in plhandler.StartEngine it will  start recommended engine
        }else
        {
            common.PutToDebugLog(2, 'EVENT, Settings set useengine: ' + selengine);
            global.useengine = selengine;
        }
    }
    
//--    if (html_engineoption.length > 3) { return; }

    common.ShowEngineOptionOnPage(function (msg, enginetouse)
    {
//--     if an engine is forced, the don't show Choose Engine option to user
        var epjava = common.GetParameter2('enginepriority_java');
        var epwebrtc = common.GetParameter2('enginepriority_webrtc');
        var epns = common.GetParameter2('enginepriority_ns');
        var epflash = common.GetParameter2('enginepriority_flash');
        if (epjava === '5' || epwebrtc === '5' || epns === '5' || epflash === '5')
        {
            return;
        }
        
//-- add choose engine option as a setting (above footer)
        html_engineoption = '<li data-icon="carat-d" id="settingitem_chooseengine"><a class="noshadow mlistitem"><div class="sett_text"><span class="sett_display_name">' + stringres.get('sett_chooseengine_title') + '</span><br><span id="sett_comment_engineservice" class="sett_comment">' + stringres.get('sett_chooseengine_comment') + '</span></div></a></li>';
        
return;
//--        var listview = j$('#settings_list').html();
//--        var footer = '';

//--        if (common.isNull(listview) || listview.length < 1 || listview.indexOf('settingitem_chooseengine') > 0) { return; }
//--        // if there are no engines
//--        var enginelist = common.GetEngineList();
//--        if (common.isNull(enginelist) || enginelist.length < 2) { return; }

//--        var pos = listview.indexOf('<li id="settings_footer');
//--        if (pos > 0)
//--        {
//--            footer = listview.substring(pos);
//--            listview = listview.substring(0, pos);
//--        }
        
//--        var engineservice = '<li data-icon="carat-d" id="settingitem_chooseengine"><a class="noshadow"><div class="sett_text"><span class="sett_display_name">' + stringres.get('sett_chooseengine_title') + '</span><br><span id="sett_comment_engineservice" class="sett_comment">' + stringres.get('sett_chooseengine_comment') + '</span></div></a></li>';
//--        listview = listview + engineservice + footer;

//--        j$('#settings_list').html('');
//--        j$('#settings_list').append(listview).listview('refresh');

//-- old footer display !!!DEPRECATED
//--        j$('#settings_engine').show();
//--        j$('#settings_engine_title').html(stringres.get('choose_engine_title'));
//--        j$('#settings_engine_msg').html(msg);
//--        if (enginetouse === 'java')
//--        {
//--            var javainstalled = common.IsJavaInstalled(); // 0=no, 1=installed, but not enabled in browser, 2=installed and enabled
//--            if (javainstalled === 0)
//--            {                
//--                j$('#btn_settings_engine').attr('href', global.INSTALL_JAVA_URL);
//--            }
//--            else if (javainstalled === 1)
//--            {
//--                if (common.GetBrowser() === 'MSIE') // can't detect if installed or just not allowed
//--                {
//--                    j$('#btn_settings_engine').attr('href', global.INSTALL_JAVA_URL);
//--                }else
//--                {
//--                    j$('#btn_settings_engine').attr('href', global.ENABLE_JAVA_URL);
//--                }
//--            }
//--        }
//--        else if (enginetouse === 'webrtc')
//--        {
//--            ;
//--        }
//--        else if (enginetouse === 'ns')
//--        {
//--            j$('#btn_settings_engine').attr('href', common.GetNPLocation());
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
//--        MeasureSettingslist();
    });
    } catch(err) { common.PutToDebugLogException(2, "_settings: ShowEngineOptionSettings", err); }
}

var  aspeak  = 'androidspeaker,';
if (common.GetOs() !== 'Android') { aspeak = ''; }

var  exregacc  = 'accounts,';
if (common.Glv() < 2) { exregacc = ''; }

//-- rejectonvoipbusy -> removed
//-- for java applet and service
var settOrderWebphone = 'serveraddress_user,sipusername,password,submenu_sipsettings,submenu_media,submenu_calldivert,submenu_general,theme,language,'+ exregacc +'email,incomingcallpopup,sendchatonenter,keeprecfiles,proxyaddress,realm,username,displayname,hidemyidentity,usetunneling,transport,use_fast_ice,use_stun,use_rport,register,registerinterval,keepaliveival,keepalive,natopenpackets,ringtimeout,calltimeout,dtmfmode,chatsms,prack,earlymedia,sendrtponmuted,defmute,changesptoring,localip,signalingport,rtpport,capabilityrequest,customsipheader,normalizenumber,techprefix,filters,callforwardonbusy,callforwardonnoanswer,callforwardalways,calltransferalways,transfwithreplace,autoignore,autoaccept,voicemailnum,callbacknumber,blacklist,transfertype,automute,autohold,holdtype,dialerintegration,integrateifwifionly,nativefilterallow,nativefilterblock,audiodevices,displayvolumecontrols,displayaudiodevice,savetocontacts,telsearchkey,extraoption,reset_settings,loglevel,loglevel_dbg,playring,codec,alwaysallowlowcodec,'+
        'audio_bandwidth,video,video_bandwidth,video_width,video_height,'+
        'cfgvideo,video_profile,videocodec,'+ aspeak +
//--        'submenu_screenshare,sscontrol,ssscroll,sstop,ssquality,'+
        'video_fps,setfinalcodec,aec,denoise,agc,plc,silencesupress,hardwaremedia,volumein,volumeout,mediaencryption,setqos,codecframecount,doublesendrtp,jittersize,audiobufferlength,speakermode';
var settOrderWebphoneWebRTCFlash = 'serveraddress_user,sipusername,password,submenu_sipsettings,submenu_media,submenu_calldivert,submenu_general,theme,language,'+ exregacc +'email,incomingcallpopup,sendchatonenter,keeprecfiles,proxyaddress,realm,username,displayname,hidemyidentity,usetunneling,ringtimeout,calltimeout,dtmfmode,chatsms,earlymedia,defmute,customsipheader,normalizenumber,techprefix,filters,voicemailnum,callbacknumber,callforwardonbusy,callforwardonnoanswer,callforwardalways,calltransferalways,transfwithreplace,autoignore,autoaccept,blacklist,dialerintegration,integrateifwifionly,nativefilterallow,nativefilterblock,audiodevices,displayvolumecontrols,displayaudiodevice,savetocontacts,telsearchkey,extraoption,reset_settings,loglevel,loglevel_dbg,codec,alwaysallowlowcodec,'+
        'audio_bandwidth,video,video_bandwidth,video_width,video_height,'+
        'cfgvideo,video_profile,videocodec,'+ aspeak +
//--        'submenu_screenshare,sscontrol,ssscroll,sstop,ssquality,'+
        'video_fps,aec,agc,volumein,volumeout';

//-- for featureset = 5 (reduced)
var settOrderReduced = 'serveraddress_user,sipusername,password,username,displayname,email,hidemyidentity,chatsms,voicemailnum,callbacknumber,loglevel';

//-- for windows softphone
var settOrderWin = 'serveraddress_user,sipusername,password,submenu_sipsettings,submenu_media,submenu_calldivert,submenu_general,theme,language,'+ exregacc +'email,sendchatonenter,keeprecfiles,proxyaddress,realm,username,displayname,flash,beeponincoming,importonlywithnum,hidemyidentity,usetunneling,transport,use_fast_ice,use_stun,use_rport,register,registerinterval,keepaliveival,keepalive,natopenpackets,ringtimeout,calltimeout,dtmfmode,chatsms,prack,earlymedia,sendrtponmuted,defmute,changesptoring,localip,signalingport,rtpport,capabilityrequest,customsipheader,normalizenumber,techprefix,filters,callforwardonbusy,callforwardonnoanswer,callforwardalways,calltransferalways,transfwithreplace,autoignore,autoaccept,rejectonvoipbusy,voicemailnum,callbacknumber,blacklist,transfertype,automute,autohold,holdtype,startwithos,dialerintegration,integrateifwifionly,nativefilterallow,nativefilterblock,audiodevices,displayvolumecontrols,displayaudiodevice,savetocontacts,telsearchkey,extraoption,reset_settings,loglevel,loglevel_dbg,playring,'
        +'video,video_bandwidth,video_width,video_height,'
        +'cfgvideo,videomode,video_profile,videocodec,'+
        'submenu_screenshare,sscontrol,ssscroll,sstop,ssquality,'+
        'video_fps,codec,setfinalcodec,alwaysallowlowcodec,aec,denoise,agc,plc,silencesupress,hardwaremedia,volumein,volumeout,mediaencryption,setqos,codecframecount,doublesendrtp,jittersize,audiobufferlength,speakermode';
//--var basicSettings = 'settobasefunctionality,serveraddress_user,sipusername,password,submenu_sipsettings,submenu_calldivert,submenu_general,submenu_integrate,username,displayname,usetunneling,transport,proxyaddress,use_stun,register,registerinterval,keepalive,ringtone,filters,transfwithreplace,autoignore,autoaccept,startonboot,dialerintegration,integrateifwifionly,nativefilterallow,nativefilterblock,email,cpualwayspartiallock,forcewifi,reset_settings,accounts,log,new_user_artcl,recharge_artcl';
var basicSettings = 'settobasefunctionality,theme,username,displayname,usetunneling,transport,proxyaddress,register,ringtone,audiodevices,startonboot,dialerintegration,integrateifwifionly,nativefilterallow,nativefilterblock,cpualwayspartiallock,forcewifi,email,loglevel,startwithos';
var basicSettingsCustomized = 'settobasefunctionality,theme,displayname,ringtone,audiodevices,startonboot,dialerintegration,integrateifwifionly,nativefilterallow,nativefilterblock,cpualwayspartiallock,forcewifi,email,loglevel,startwithos';
//-- not used  var highlightedSettings = 'displayname,usetunneling,ringtone,startonboot,startwithos,submenu_integrate,dialerintegration';
var currGroup = 20;

var printdevice = true; // print device only once
function PopulateList() // :no return value
{
    try{
    common.DoVersioning();
    
    EngineSelectStage1();

    ShowEngineOptionSettings();
//--    if (currGroup !== common.StrToInt(common.GROUP_LOGIN) && isSettLevelBasic === false)
//--    {
//--        ShowEngineOptionSettings(true); // always show engine options in advanced settings -> group SIP
//--    }else
//--    {
//--        ShowEngineOptionSettings(false);
//--    }
    common.SetCurrTheme();
    
// put username / password in login fields
    if (ShowLoginPage())
    {
        if (common.ShowServerInput())
        {
            common.SaveParameter('iswebrtcuppersrvfromuser', 'true');
//--            upperserverfromuser  0=not needed, 1=no need to enter (preconfigured), 2=maybe,3=yes
//--             !!!! HACK !!!
            if (common.GetParameter('showserverinput') === '1' && common.GetConfigInt('upperserverfromuser', 2) < 2)
            {
                ;
            }else
            {
                j$('#lp_serveraddress').val(common.GetParameter('serveraddress_user'));
//--                document.getElementById('lp_serveraddress').style.display = 'block';
                j$('#lp_serveraddress').closest( 'div.ui-input-text' ).show();
            }
        }

        if (common.GetConfigInt('brandid', -1) !== 58) // enikma
        {
            j$('#lp_username').val(common.GetParameter('sipusername'));
            j$('#lp_password').val(common.GetParameter('password'));
        }
        
//--     Kéne legyen rá lehetőség, hogy müködjön jelszó nélkül.
//--	- Pl. ha a password „nopassword” –ra van állitva, akkor ezt kezelni kéne speciálisan a softphone skin –en: annyi az összes tennivaló,
//--		hogy ilyenkor nemkéne megjeleniteni a password inputot a settingsben és a login képernyőn. Semmi más változtatás nem kell.
//--	- if username is "anonymous", then treat as nopassword
        if (common.GetParameter('sipusername') === 'anonymous')
        {
            j$('#lp_username').hide();
        }
        if (common.GetParameter('password') === 'nopassword')
        {
            j$('#lp_password').hide();
        }
    }
    MeasureSettingslist();

    if ( common.isNull(document.getElementById('settings_list')) )
    {
        common.PutToDebugLog(2, "ERROR, _settings: PopulateList listelement is null");
        return;
    }
    
    common.PutToDebugLog(5, 'EVENT, _settings Starting populate list');
    
    var listview = '';

    var settOrderTmp = '';
//--    if (common.GetParameter('devicetype') === common.DEVICE_WIN_SOFTPHONE())
    if (common.IsWindowsSoftphone())
    {
        if (printdevice) { common.PutToDebugLog(2, 'EVENT, settings: Device: Windows softphone'); }
        settOrderTmp = settOrderWin;
        
//--         hide the startwithos option once it is already set
        if (common.ParameterIsDefault('startwithos', true) === false)
        {
            settOrderTmp = settOrderTmp.replace(',startwithos', '');
        }
    }else
    {
        if (printdevice) { common.PutToDebugLog(2, 'EVENT, settings: Device: browser webphone'); }
        settOrderTmp = settOrderWebphone;
        if (common.getuseengine() === global.ENGINE_WEBRTC || common.getuseengine() === global.ENGINE_FLASH)
        {
            settOrderTmp = settOrderWebphoneWebRTCFlash;
        }
        
//--         remove enginepriority_nativedial id not mobile
        
        if (common.GetOs() !== 'Android' && common.GetOs() !== 'iOS')
        {
            settOrderTmp.replace('enginepriority_nativedial,', '');
        }
    }
    
    if (common.GetConfigInt('brandid', -1) === 50) // favafone
    {
        basicSettingsCustomized = 'startwithos,loglevel,displayvolumecontrols,displayaudiodevice,savetocontacts';
        settOrderTmp = 'startwithos,loglevel,displayvolumecontrols,displayaudiodevice,savetocontacts';
    }
    if (currfeatureset < 6) // reduced
    {
       settOrderTmp = settOrderReduced;
    }
    
    printdevice = false;
    
    if (common.Glvd() === false)
    {
        settOrderTmp = settOrderTmp.replace('videocodec,', '');
        settOrderTmp = settOrderTmp.replace('video_fps,', '');
        settOrderTmp = settOrderTmp.replace('video_profile,', '');
        settOrderTmp = settOrderTmp.replace('cfgvideo,', '');
        settOrderTmp = settOrderTmp.replace('video_height,', '');
        settOrderTmp = settOrderTmp.replace('video_width,', '');
        settOrderTmp = settOrderTmp.replace('video_bandwidth,', '');
        settOrderTmp = settOrderTmp.replace('video,', '');
    }
    if (common.Glv() < 2)
    {
//--          + conference, call recording, file transfer
        if (common.Glv() < 1)
        {
            settOrderTmp = settOrderTmp.replace('callforwardonbusy,', '');
            settOrderTmp = settOrderTmp.replace('callforwardonnoanswer,', '');
            settOrderTmp = settOrderTmp.replace('callforwardalways,', '');
            settOrderTmp = settOrderTmp.replace('calltransferalways,', '');
            settOrderTmp = settOrderTmp.replace('transfertype,', '');
        }
    }

    var loopindex = 0;
    while (settOrderTmp.length > 0 && loopindex < 5000)
    {
        loopindex++;
        
        var listitem = '';
        
        var pos = settOrderTmp.indexOf(",");
        if (pos <= 0)
        {
            if (settOrderTmp.length > 0)
            {
                pos = settOrderTmp.length;
            }else
            {
                break;
            }
        }
	    	
        var settName = settOrderTmp.substring(0, pos);
        if (pos + 1 < settOrderTmp.length) { settOrderTmp = ( common.Trim(settOrderTmp.substring(pos + 1))); } else { settOrderTmp = ""; }

        if ( common.isNull(settName) || settName.length < 1) { continue; }

        var value = common.settmap2[settName];

        if( common.isNull(value) ) { continue; }

        var settValue = value[common.SETT_VALUE];
        var settType = value[common.SETT_TYPE];
        var settIsdefault = value[common.SETT_ISDEFAULT];
        
        var settGroupingInt = 0;
        try{ settGroupingInt = common.StrToInt( common.Trim( value[common.SETT_GROUP]));
             if ( common.isNull(settGroupingInt) ) { settGroupingInt = 0; }
        } catch(errin){ common.PutToDebugLogException(3,"_settings: populateList settGrouping can't be converted to integer", errin); }
        
//-- hide http requests in customized version
//--        if (common.GetParameterBool('customizedversion', true) === true)
//--        {
//--            if (settName === 'creditrequest' || settName === 'ratingrequest' || settName === 'p2p' || settName === 'callback' || settName === 'sms')
//--            {
//--                continue;
//--            }
//--        }

// display all setttings when search / filter is visible
        if (!filtervisible)
        {
            //display only current group
            if (isSettLevelBasic)
            {
                if (currGroup === common.StrToInt(common.GROUP_LOGIN))
                {
                    if (settGroupingInt !== currGroup && settName !== 'accounts')
                    {
                        continue;
                    }
                }
                else
                {
                    if (common.GetParameterBool('customizedversion', true) === true)
                    {
                        if (basicSettingsCustomized.indexOf(settName) < 0)
                        {
                            continue;
                        }
                    }else
                    {
                        if (basicSettings.indexOf(settName) < 0)
                        {
                            continue;
                        }
                    }
                }
            }else
            {
                if (settGroupingInt !== currGroup && settName !== 'accounts' && settName !== 'ringtone'  && settName !== 'serveraddress_user')
                {											// accounts is shown in main settings too, if there are more than 1 account
                    continue;
                }
            }
            
//--            if (settGroupingInt !== currGroup && settName !== 'accounts' && settName !== 'ringtone')
//--            {											// accounts is shown in main settings too, if there are more than 1 account
//--                continue;
//--            }
//--            if (currGroup !== common.StrToInt(common.GROUP_LOGIN) && isSettLevelBasic && basicSettings.indexOf(settName) < 0)
//--            {
//--                continue;
//--            }
        }
        
        if (common.GetConfigInt('brandid', -1) === 60) //-- voipmuch
        {
            if (settName === 'username') { continue; } //-- hide caller ID
        }
        
        if (settName === 'accounts')
        {
            /*if ((isSettLevelBasic && currGroup !== common.StrToInt(common.GROUP_LOGIN)) ||
                    currGroup === common.StrToInt(common.GROUP_GENERAL) ||
                    (currGroup === common.StrToInt(common.GROUP_LOGIN) && !common.isNull(global.sipaccounts) && global.sipaccounts.length > 1))*/
            if (currGroup === common.StrToInt(common.GROUP_GENERAL) ||
                    (currGroup === common.StrToInt(common.GROUP_LOGIN) && !common.isNull(global.sipaccounts) && global.sipaccounts.length > 1))
            {
                ;
            }else
            {
                continue;
            }
        }
        
//-- dialer integration not implemented
        if (settGroupingInt === common.StrToInt(common.GROUP_INTEGRATE))
        {
            continue;
        }

        var settDisplayName = stringres.get('sett_display_name_'+settName);
        var settComment = stringres.get('sett_comment_'+settName);
        var settCommentShort = stringres.get('sett_comment_short_'+settName);
        
        if ( common.isNull(settType) || settType.length < 1 || 
                (settType !== '0' && settType !== '1' && settType !== '2' && settType !== '3' && settType !== '4'
                && settType !== '5' && settType !== '6' && settType !== '7' && settType !== '8'))
        {
            if (settType !== '-1')
            {
                common.PutToDebugLog(2,"ERROR, _settings: "+settType+" is incorrectly defined in InitializeSettings");
            }
            continue;
        }
        
        if (common.HideSettings(settName, settDisplayName, settName) === true) { continue; }
        
//--     Kéne legyen rá lehetőség, hogy müködjön jelszó nélkül.
//--	- Pl. ha a password „nopassword” –ra van állitva, akkor ezt kezelni kéne speciálisan a softphone skin –en: annyi az összes tennivaló,
//--		hogy ilyenkor nemkéne megjeleniteni a password inputot a settingsben és a login képernyőn. Semmi más változtatás nem kell.
//--	- if username is "anonymous", then treat as nopassword
        if (settName === 'sipusername')
        {
            if (settValue === 'anonymous') { continue; }
//--         if username or password is set fixed in webphone_api.parameters or config.js, then don't display user/pwd input
            var usr1 = webphone_api.parameters['username'];
            var usr2 = webphone_api.parameters['sipusername'];
            var usr3 = common.GetConfig('username');
            var usr4 = common.GetConfig('sipusername');
            
            if ((!common.isNull(usr1) && usr1.length > 0 && usr1 !== 'USERNAME' && usr1 !== 'SIPUSERNAME')
                    || (!common.isNull(usr2) && usr2.length > 0 && usr2 !== 'USERNAME' && usr2 !== 'SIPUSERNAME')
                    || (!common.isNull(usr3) && usr3.length > 0 && usr3 !== 'USERNAME' && usr3 !== 'SIPUSERNAME')
                    || (!common.isNull(usr4) && usr4.length > 0 && usr4 !== 'USERNAME' && usr4 !== 'SIPUSERNAME'))
            {
                continue;
            }
        }
        if (settName === 'password')
        {
            if (settValue === 'nopassword') { continue; }
            // if username or password is set fixed in webphone_api.parameters or config.js, then don't display user/pwd input
            var pwd1 = webphone_api.parameters['password'];
            var pwd2 = common.GetConfig('password');
            
            if ((!common.isNull(pwd1) && pwd1.length > 0 && pwd1 !== 'PASSWORD' && pwd1 !== 'SIPPASSWORD' && pwd1 !== 'SIPASSWORD')
                    || (!common.isNull(pwd2) && pwd2.length > 0 && pwd2 !== 'PASSWORD' && pwd2 !== 'SIPPASSWORD' && pwd2 !== 'SIPASSWORD'))
            {
                continue;
            }
        }
        
        if (settName === 'serveraddress_user')
        {
            if (common.ShowServerInput())
            {
                if (currGroup !== common.StrToInt(common.GROUP_LOGIN) && currGroup !== common.StrToInt(common.GROUP_SIP))
                {
                    continue;
                }
                
                common.SaveParameter('iswebrtcuppersrvfromuser', 'true');
//--                upperserverfromuser  0=not needed, 1=no need to enter (preconfigured), 2=maybe,3=yes
//--                 !!!! HACK !!!
                if (common.GetParameter('showserverinput') === '1' && common.GetConfigInt('upperserverfromuser', 2) < 2)
                {
                    continue;
                }

                settDisplayName = common.GetParameter('server_label');
                if ((settDisplayName.toLowerCase()).indexOf('op code') >= 0 || (settDisplayName.toLowerCase()).indexOf('operator code') >= 0)
                {
                    settComment = stringres.get('sett_comment_serveraddress_user_operator');
                }
            }else
            {
                continue; //-- don't show server input
            }
        }
        
        if (settName === 'theme' && (common.GetConfig('showtheme') === 'false' || common.GetParameterBool('customizedversion', false) === true)) { continue; }
        
        if (settName === 'loglevel_dbg')
        {
            var loglevel = common.GetLogLevel();
            if (loglevel < 2)
            {
                continue;
            }
        }
        
        if (settName === 'telsearchkey')
        {
            if (common.isNull(common.GetConfig('telsearchurl')) || common.GetConfig('telsearchurl').length < 3)
            {
                continue;
            }
        }
        
//--         show only username/password on first start
//--        if (common.GetParameter('customizedversion') === 'true' && startedfrom !== 'app')
//--        {
//--            if (common.ShowServerInput())
//--            {
//--                if (settName !== 'serveraddress_user' && settName !== 'sipusername' && settName !== 'password')
//--                {
//--                    continue;
//--                }
//--            }else
//--            {
//--                if (settName !== 'sipusername' && settName !== 'password')
//--                {
//--                    continue;
//--                }
//--            }
//--        }
        
//-- not used
//--        if (!isSettLevelBasic && highlightedSettings.indexOf(settName) >= 0)
//--        {
//--            settDisplayName = '<b>' + settDisplayName + '</b>';
//--        }

        var comment = '';
        
        if (settIsdefault === '0' || settName === 'sipusername' || settName === 'password' || settName === 'serveraddress_user') // means the default value was changed
        {
            comment = GetSettComment(settName) + ' ' + GetSettFormattedValue(settName);
        }else
        {
            comment = GetSettComment(settName);
        }
        
        if (common.GetParameter('serverinputisupperserver') === 'true')
        {
            if (settName === 'serveraddress_user')
            {
                if (common.GetParameterInt('brandid', -1) === 2) // gmsdialergold
                {
                    comment = stringres.get('sett_comment_serveraddress_user_gmsdialer') + ' ' + GetSettFormattedValue(settName);
                }else
                {
                    comment = GetSettComment(settName) + ' ' + GetSettFormattedValue(settName);
                }
            }
        }
        
        if (settName === 'serveraddress_user')
        {
            if (common.GetConfig('server_comment').length > 1)
            {
                comment = common.GetConfig('server_comment') + ' ' + GetSettFormattedValue(settName);
            }
        }
        
        if (settName === 'transport')
        {
            if (common.GetParameter('serverinputisupperserver') === 'true' || common.GetParameterBool('autotransportdetect', false) === true)
            {
                continue;
            }
        }
        
// if demo index page, then also read settings from cookie
        try{
        if (window.location.href.indexOf('isdemopage=true') > 0
                && (settName === 'sipusername' || settName === 'username' || settName === 'password' || settName === 'sippassword' || settName === 'serveraddress_user'
                || settName === 'serveraddress_orig' || settName === 'serveraddress' || settName === 'upperserver' || settName === 'callto' || settName === 'destination'))
        {
            var tmp = webphone_api.getparameter(settName);
            if (settName === 'sipusername' && tmp.length < 1) { tmp = webphone_api.getparameter('username'); }
            if (settName === 'serveraddress_user' && tmp.length < 1 && common.RequestUserServerInput() === false) { tmp = webphone_api.getparameter('serveraddress'); }
            if (!common.isNull(tmp) && tmp.length > 0 &&
                    (common.isNull(settValue) || settValue.length < 1))
            {
                webphone_api.setparameter(settName, tmp);
                settValue = tmp;
            }
        }
        } catch(e) { common.PutToDebugLogException(2, '_settings: Populateliet inner1', e); }
        
        
        
//--<li data-icon="carat-d"><a href="javascript:void(0)" class="noshadow"><div class="sett_text"><span class="sett_display_name">Username</span><br><span class="sett_comment">Sip account username Sip account username Sip account username</span></div></a></li>
//--<li data-icon="false"><a href="javascript:void(0)" class="noshadow"><div class="sett_text"><span class="sett_display_name">Password</span><br><span class="sett_comment">Sip account password Sip account password Sip account password</span></div><div class="sett_image"><img src="images\checkbox_true.png" /></div></a></li>
        
//--        listitem = '<li data-icon="[SETTICON]" id="[ITEMID]"><a href="javascript:void(0)" class="noshadow"><div class="sett_text"><span class="sett_display_name">[DISPLAYNAME]</span><br><span id="[COMMENTID]" class="sett_comment">[COMMENT]</span></div>[TRUEFALSEIMG]</a></li>';
        listitem = '<li data-icon="[SETTICON]" id="[ITEMID]"><a class="noshadow mlistitem"><div class="sett_text"><span class="sett_display_name">[DISPLAYNAME]</span><br><span id="[COMMENTID]" class="sett_comment">[COMMENT]</span></div>[TRUEFALSEIMG]</a></li>';
        
        /**type - 0 = checkbox, 1 = text box, 2 = drop down list, 3 = drop down list and checkbox,
		    	 4 = seek bar, 5 = open new activity, 6 = submenu, 7 = drop down list from XML string-array, 8 = custom*/
        
        if (settType === '0')
        {
            // handle 2 as TRUE and 1 as FALSE
            if (settName === 'flash' || settName === 'sscontrol' || settName === 'ssscroll' || settName === 'sstop')
            {
                if (settValue === '2') { settValue = 'true'; }else{ settValue = 'false'; }
            }
            else if (settName === 'beeponincoming')
            {
                if (settValue === '1') { settValue = 'true'; }else{ settValue = 'false'; }
            }
            
            if (settName === 'loglevel') // handle loglevel separatelly, because values range from 1 to 5 or more
            {
                var tmplevel = common.StrToInt(settValue);
                if (tmplevel > 1)
                {
                    listitem = listitem.replace('[TRUEFALSEIMG]', '<div class="sett_image"><img src="' + common.GetElementSource() + 'images/checkbox_true.png" id="img_' + settName + '" /></div>');
                }else
                {
                    listitem = listitem.replace('[TRUEFALSEIMG]', '<div class="sett_image"><img src="' + common.GetElementSource() + 'images/checkbox_false.png" id="img_' + settName + '" /></div>');
                }
            }
            else if (settValue === 'true')
            {
                listitem = listitem.replace('[TRUEFALSEIMG]', '<div class="sett_image"><img src="' + common.GetElementSource() + 'images/checkbox_true.png" id="img_' + settName + '" /></div>');
            }else
            {
                listitem = listitem.replace('[TRUEFALSEIMG]', '<div class="sett_image"><img src="' + common.GetElementSource() + 'images/checkbox_false.png" id="img_' + settName + '" /></div>');
            }
            
            listitem = listitem.replace('[SETTICON]', 'false');
        }else
        {
            listitem = listitem.replace('[TRUEFALSEIMG]', '');
        }
            
        if (settType === '1' || settType === '2' || settType === '3' || settType === '4' || settType === '5' || settType === '7' || settType === '8')
        {
            listitem = listitem.replace('[SETTICON]', 'carat-d');
        }

        if (settType === '6')
        {
            listitem = listitem.replace('[SETTICON]', 'carat-r');
        }
        
        listitem = listitem.replace('[ITEMID]', 'settingitem_' + settName);
        listitem = listitem.replace('[DISPLAYNAME]', settDisplayName);
        listitem = listitem.replace('[COMMENT]', comment);
        listitem = listitem.replace('[COMMENTID]', 'sett_comment_' + settName);

        listview = listview + listitem;
    }
    
    } catch(err) { common.PutToDebugLogException(2, "_settings: PopulateList", err); }
    
    setTimeout(function ()
    {
        common.HideModalLoader();
    }, 800);

// setitngs entry
    if ((common.GetParameterBool('customizedversion', true) !== true || startedfrom === 'app') && currGroup === common.StrToInt(common.GROUP_LOGIN))
    {
        var settenteritem = '<li data-icon="carat-r" id="settingitem_entersettings"><a class="noshadow mlistitem"><div class="sett_text"><span class="sett_display_name">' + stringres.get('sett_display_name_entersettings') + '</span><br><span id="sett_comment_advancedsettings" class="sett_comment">' + stringres.get('sett_comment_entersettings') + '</span></div></a></li>';
        listview = listview + settenteritem;
    }

// advanced settings entry
    if (common.HideSettings('advancedsettings', '', 'advancedsettings') === false)
    {
        if (isSettLevelBasic && currGroup === common.StrToInt(common.GROUP_MAIN) && currfeatureset > 5)
        {
            var advanceditem = '<li data-icon="carat-r" id="settingitem_advancedsettings"><a class="noshadow mlistitem"><div class="sett_text"><span class="sett_display_name">' + stringres.get('sett_display_name_advancedsettings') + '</span><br><span id="sett_comment_advancedsettings" class="sett_comment">' + stringres.get('sett_comment_advancedsettings') + '</span></div></a></li>';
            listview = listview + advanceditem;
        }
    }

//-- service plugin (service engine) suggestion !!!DEPRECATED
 //--   if (common.GetParameter('devicetype') === common.DEVICE_WEBPHONE() && currGroup === common.StrToInt(common.GROUP_LOGIN)
//--            && global.enableservice && global.useengine > -1 && global.useengine !== global.ENGINE_SERVICE
//--            && global.useengine !== global.ENGINE_WEBPHONE && !common.IsServiceInstalled())
//--    {
//--        var engineservice = '<li data-icon="carat-r" id="settingitem_engineservice"><a class="noshadow"><div class="sett_text"><span class="sett_display_name">' + stringres.get('serviceengine_title') + '</span><br><span id="sett_comment_engineservice" class="sett_comment">' + stringres.get('serviceengine_msg') + '</span></div></a></li>';
//--        listview = listview + engineservice;
//--    }

//--// choose  engine for testing !!!DEPRECATED
//--    if (common.StrToInt(common.GROUP_LOGIN))
//--    {
//--        var engine = '<li data-icon="[SETTICON]" id="[ITEMID]"><a class="noshadow"><div class="sett_text"><span class="sett_display_name">[DISPLAYNAME]</span><br><span id="[COMMENTID]" class="sett_comment">[COMMENT]</span></div>[TRUEFALSEIMG]</a></li>';
//--        if (global.enablewebrtc)
//--        {
//--            engine = engine.replace('[TRUEFALSEIMG]', '<div class="sett_image"><img src="' + common.GetElementSource() + 'images/checkbox_true.png" id="img_' + settName + '" /></div>');
//--        }else
//--        {
//--            engine = engine.replace('[TRUEFALSEIMG]', '<div class="sett_image"><img src="' + common.GetElementSource() + 'images/checkbox_false.png" id="img_' + settName + '" /></div>');
//--        }
//--        engine = engine.replace('[SETTICON]', 'false');
//--        engine = engine.replace('[ITEMID]', 'chooseengine');
//--        engine = engine.replace('[DISPLAYNAME]', 'Use WebRTC');
//--        engine = engine.replace('[COMMENT]', 'If checked uses WebRTC esle uses Java');
//--        listview = listview + engine;
//--    }


//-- show chooseengine setting on login page only if previous engine could not register; 0=unknown, 1=failed, 2=if we received any notification
if (global.isdebugversion_showengineselection === true || common.GetParameterInt('enproblem', 0) > 0)
{
    html_engineoption = '<li data-icon="carat-d" id="settingitem_chooseengine"><a class="noshadow mlistitem"><div class="sett_text"><span class="sett_display_name">' + stringres.get('sett_chooseengine_title') + '</span><br><span id="sett_comment_engineservice" class="sett_comment">' + stringres.get('sett_chooseengine_comment') + '</span></div></a></li>';
    listview = html_engineoption + listview;
}else
{
    if((currGroup === common.StrToInt(common.GROUP_LOGIN) && common.GetParameter('lastsessionsuccess') === '1')
            || (currGroup === common.StrToInt(common.GROUP_SIP) && isSettLevelBasic === false))
    {
        if (common.isNull(html_engineoption)) { html_engineoption = ''; }
        listview = html_engineoption + listview;
    }
}
//--    var footer = '<li id="settings_footer"><button id="btn_cancel" class="ui-btn ui-btn-corner-all ui-btn-b noshadow">' + stringres.get('btn_cancel') + '</button><button id="btn_login" class="ui-btn ui-btn-corner-all ui-btn-b noshadow">' + stringres.get("btn_login") + '</button></li>';
    
    var btnlogintitle = '';
    if (startedfrom === 'app' && ismodified === true)
    {
        btnlogintitle = stringres.get('btn_save');
    }else
    {
        btnlogintitle = stringres.get('btn_login');
    }
    var footer = '<li id="settings_footer"><button id="btn_login" class="ui-btn ui-btn-corner-all ui-btn-b noshadow">' + btnlogintitle + '</button></li>';

    var usrtmp = common.GetParameter('sipusername'); if (common.isNull(usrtmp)) { usrtmp = ''; }
    var pwdtmp = common.GetParameter('password'); if (common.isNull(pwdtmp)) { pwdtmp = ''; }

    if (currGroup === common.StrToInt(common.GROUP_LOGIN)
            || (usrtmp.length > 0 && pwdtmp.length > 0))
    {
        listview = listview + footer;
    }
    
    var newuseruri = common.GetParameter('newuser');
    if (!common.isNull(newuseruri) && newuseruri.length > 2 && startedfrom !== 'app' && currGroup === common.StrToInt(common.GROUP_LOGIN))
    {
        listview = listview + '<a href="javascript:;" id="al_newuser" class="settings_links" target="_blank">' + stringres.get('newuser') + '</a>';

//-- OLD button style
//--        var newuser = '<li id="newuser_container"><button id="btn_newuser" class="ui-btn ui-btn-corner-all ui-btn-b noshadow">' + stringres.get('newuser') + '</button></li>';
//--        listview = listview + newuser;
    }

    j$('#settings_list').html('');
    j$('#settings_list').append(listview).listview('refresh');
    
    j$("#al_newuser").on("click", function(event) { OnNewUserClicked(); event.preventDefault(); });

//--    j$('#settings_footer').off('click');
    
    var trigerred = false; // handle multiple clicks
    j$("#btn_login").on("click", function()
    {
        if (trigerred) { return; }
    
        trigerred = true;
        setTimeout(function ()
        {
            trigerred = false;
        }, 1000);
        
        common.PutToDebugLog(3, 'EVENT, settings button login clicked');
        
        SaveSettings(true);
    });
    j$("#btn_cancel").on("click", function()
    {
//--        common.OpenWebURL('http://www.mizu-voip.com');
//--        common.ShowToast('test toast');
//--        j$.mobile.changePage("#page_messagelist", { transition: "pop", role: "page" });
//--        common.SaveSettingsFile();
        alert('Cancel');
        
//--        common.AlertDialog('Test', stringres.get('proversion_content_text'))
//--        common.UpgradeToProVersion();
    });
    common.PutToDebugLog(5, 'EVENT, _settings List populated');
//--    listElem.innerHTML = listview;
//--    listElem.listview('refresh');
//--    j$(menuId).append('<li><a href="javascript:;" id="' + MENUITEM_SETTINGS_EXIT + '" onclick="MenuItemSelected(\'' + MENUITEM_SETTINGS_EXIT + '\')" >Exit</a></li>').listview('refresh');
}

var ismodified = false; // change button text (Login / Save) based on if any setting was clicked
var ulist = []; // list of engines to be displayed for users
var srvc_installed = false;
function OnListItemClick (id) // :no return value
{
    try{
    common.PutToDebugLog('EVENT, _settings: OnListItemClick click, id: ' + id);
        
//-- choose  engine
        if (id === 'chooseengine')
        {
            global.enablewebrtc = !global.enablewebrtc;
            PopulateList();
            return;
        }
        

    if (common.isNull(id) || id.length < 1)
    {
        common.PutToDebugLog(2, 'ERROR, _settings OnListItemClick id is NULL');
        return;
    }
    
    if (id === 'settingitem_entersettings')
    {
        ShowSettings();
        return;
    }
    
    if (id === 'settingitem_advancedsettings')
    {
        SwitchBetweenBasicAdvanced();
        return;
    }
    
    //-- handle choose engine
    if (id === 'settingitem_chooseengine')
    {
        var enginelist = common.GetEngineList();
        if (common.isNull(enginelist) || enginelist.length < 2) { return; }
        
    // request now, so when user clicks ok, we already have the result; tricky handling, just check the code below
        common.IsServiceInstalled(function (installed)
        {
            if (installed === true)
            {
                srvc_installed = true;
            }else
            {
                srvc_installed = false;
            }
        });
        
        ulist = []; //-- list of engines to be displayed for users
        var selname = common.GetSelectedEngineName();
        var recname = common.GetRecommendedEngineName();

        var e_sel = '3'; //-- selected engine (for option select dropdown)
        var e_rec = '2'; //-- recomended engine (for option select dropdown)
        var e_avail = '1'; //-- available, but not selected and not recommended engine (for option select dropdown)
        var e_dis = '0'; //-- disabled engine (for option select dropdown)
        
        for(var i = 0; i < enginelist.length; i++)
        {
            var engine = enginelist[i];
//--             "java", "webrtc", "ns", "app", "flash", "p2p", "accessnum", "nativedial", "otherbrowser", "java_avail",
            if (common.isNull(engine) || common.isNull(selname) || selname.length < 1
                    || (engine.name !== 'java' && engine.name !== 'webrtc' && engine.name !== 'ns'
                    && engine.name !== 'app' && engine.name !== 'flash'))
            {
                continue;
            }
            
            var defpriority = engine.defpriority;
            
            var type = '0';
            if (engine.name === selname) { type = '3'; defpriority = defpriority * 10;}
            else if (engine.name === recname) { type = '2'; defpriority = defpriority * 4; }
            else if (common.EngineIsSupported(engine.name) > 0) { type = '1'; }
            
            var typeint = common.StrToInt(type);
            
            var item = [];
            item[0] = engine.name;
            item[1] = type;
            item[2] = (typeint * defpriority).toString();
            
            ulist.push(item);
        }
        
        if (common.isNull(ulist) || ulist.length < 1) { return; }
        
//-- sort values in priority order (desc) in ulist -> firts selected, then recommended, ...
        ulist.sort(function (a,b) //-- comparator function
        {
            if ( a[2] > b[2] ) { return -1; }
            if ( a[2] < b[2] ) { return 1; }
            return 0;
        });
        
        for (var i = 0; i < ulist.length; i++)
        {
            var item = ulist[i];
        }
        
//--showing options dialog
        var radiogroup = '';
        for (var i = 0; i < ulist.length; i++)
        {
            var oneen = ulist[i];
            if (common.isNull(oneen) || oneen.length < 1) { continue; }
            
            var item = '<input name="' + mCurrSettName + '" id="[INPUTID]" value="[VALUE]" [CHECKED] [DISABLED] type="radio">' +
                    '<label for="[INPUTID]" [NOTBOLD]>[LABEL]</label>';

            item = item.replace('[INPUTID]', 'ensel_' + oneen[0]);
            item = item.replace('[INPUTID]', 'ensel_' + oneen[0]); //-- twice
            item = item.replace('[VALUE]', oneen[0]);
            
            if (oneen[1] === '3') // selected engine
            {
                item = item.replace('[CHECKED]', 'checked="checked"');
                item = item.replace('[LABEL]', common.GetEngineDisplayName(oneen[0]) + ' (' + stringres.get('sett_ce_highly') + ')');
                item = item.replace('[NOTBOLD]', '');
            }
            else if (oneen[1] === '2')
            {
                item = item.replace('[LABEL]', common.GetEngineDisplayName(oneen[0]) + ' (' + stringres.get('sett_ce_recommended') + ')');
                item = item.replace('[NOTBOLD]', '');
            }
            else if (oneen[1] === '0')
            {
                item = item.replace('[DISABLED]', 'disabled="disabled"');
                
            }
            
            item = item.replace('[CHECKED]', '');
            item = item.replace('[DISABLED]', '');
            item = item.replace('[NOTBOLD]', 'style="font-weight: normal;"');
            item = item.replace('[LABEL]', common.GetEngineDisplayName(oneen[0]));
        
            radiogroup = radiogroup + item;
        }
        
        var pWidth = common.GetDeviceWidth();
        if ( !common.isNull(pWidth) && common.IsNumber(pWidth) && pWidth > 100 )
        {
            pWidth = Math.floor(pWidth / 1.2);
        }else
        {
            pWidth = 220;
        }
        
        var template = '' +
'<div id="settings_user_ce_select" data-role="popup" class="ui-content messagePopup" data-overlay-theme="a" data-theme="a" style="max-width:' + pWidth + 'px; min-width: ' + Math.floor(pWidth * 0.6) + 'px;">' +
    '<div data-role="header" data-theme="b">' +
        '<a href="javascript:;" data-role="button" data-icon="delete" data-iconpos="notext" class="ui-btn-right closePopup">Close</a>' +
        '<h1 class="adialog_title">' + stringres.get('sett_chooseengine_popup_title') + '</h1>' +
    '</div>' +
    '<div role="main" class="ui-content adialog_content_select">' +
    
//--        '<form id="settings_select_2">' +
        '<fieldset id="settings_select_2" data-role="controlgroup">' + radiogroup +
//--            '<legend>Select transport layer protocol</legend>' +
//--            '<input name="radio-choice-v-2" id="radio-choice-v-2a" value="on" checked="checked" type="radio">' +
//--            '<label for="radio-choice-v-2a">One</label>' +
//--            '<input name="radio-choice-v-2" id="radio-choice-v-2b" value="off" type="radio">' +
//--            '<label for="radio-choice-v-2b">Two</label>' +

        '</fieldset>' +
//--        '</form>' +
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
//--                j$('#adialog_positive').off('click');
//--                j$('#adialog_negative').off('click');
                popupafterclose();
            }
        });

//-- listen for enter onclick, and click OK button
//--     !!NOT WORKING
 //--       j$( "#settings_user_ce_select" ).keypress(function( event )
//--        {
//--            if ( event.which === 13)
//--            {
//--                event.preventDefault();
//--                j$("#adialog_positive").click();
//--            }else
//--            {
//--                return;
//--            }
//--        });
        
// we must use onclick, otherwise window.open() gets blocked by popup blocker
        j$('#adialog_positive').on('click', function (event)
        {
            //var newen = j$(this).attr ("value");
            var newen = j$("#settings_select_2 :radio:checked").val();
            
            common.ResetEngineClicked();
            
//--    j$.mobile.activePage.find(".messagePopup").popup("close");
//--            j$( '#settings_user_ce_select' ).on( 'popupafterclose', function( event )
//--            {
                common.PutToDebugLog(3, 'EVENT, _settings: selected engine by user: ' + newen);

//--             select the engine
                if (newen === 'java'){ ; }
                else if (newen === 'webrtc')
                {
                    common.PutToDebugLog(2, 'EVENT, _settings: chooseengine reset useengine_1');
                    global.useengine = ''; //-- must be reset, otherwise plhandler.StartEngine() interprets it like the selected engine was not working, and starts recommended engine
                }
                else if (newen === 'ns')
                {
//--                     for ns engine we have to call this before changing window.location, otherwise it will not be called
                    var currengine = common.GetEngine(newen);
                    if (!common.isNull(currengine))
                    {
                        common.PutToDebugLog(2, 'EVENT, _settings: chooseengine reset useengine_2');
                        global.useengine = ''; // must be reset, otherwise plhandler.StartEngine() interprets it like the selected engine was not working, and starts recommended engine
                        currengine.clicked = 2;
                        common.SetEngine(newen, currengine);

//--                        common.ShowToast(common.GetEngineDisplayName(newen) + ' ' + stringres.get('ce_use'), 3000, function ()
//--                        {
//--                            common.ChooseEngineLogic2(newen);
//--                        });*/
                        
                        common.IsServiceInstalled(function (installed)
                        {
                            if (installed === true)
                            {
                                srvc_installed = true;
                                common.ShowToast(common.GetEngineDisplayName(newen) + ' ' + stringres.get('ce_use'), 3000, function ()
                                {
//--                                    common.ChooseEngineLogic2(newen);
                                });
                            }
                        });

                        common.EngineSelect(1);
                    }

                    if (srvc_installed === false) //-- this should not be in IsServiceInstalled:callback, because window.open will only work on user interaction (click)
                    {
//--                         wait for this popup to close
                        setTimeout(function ()
                        {
                            common.NPDownloadAndInstall();
                        }, 350);
                        
                        var downloadurl = common.GetNPLocation();
                        if (!common.isNull(downloadurl) && downloadurl.length > 0)
                        {
                            window.open(downloadurl);
                            //--window.location.assign(downloadurl);
                            //--window.location.href = downloadurl;
                        }
                    }
                }
                else if (newen === 'flash')
                {
                    common.PutToDebugLog(2, 'EVENT, _settings: chooseengine reset useengine_3');
                    global.useengine = ''; //-- must be reset, otherwise plhandler.StartEngine() interprets it like the selected engine was not working, and starts recommended engine
                }
                else if (newen === 'app')
                {
                    ;
                }

                if (newen !== 'ns')
                {
                    var currengine = common.GetEngine(newen);
                    if (!common.isNull(currengine))
                    {
                        common.PutToDebugLog(2, 'EVENT, _settings: chooseengine reset useengine_4');
                        global.useengine = ''; // must be reset, otherwise plhandler.StartEngine() interprets it like the selected engine was not working, and starts recommended engine
                        currengine.clicked = 2;
                        common.SetEngine(newen, currengine);

                        common.ShowToast(common.GetEngineDisplayName(newen) + ' ' + stringres.get('ce_use'), 3000, function ()
                        {
                            common.ChooseEngineLogic2(newen);
                        });
                        
                        common.EngineSelect(1);
                    }
                }

//--                j$.mobile.activePage.find(".messagePopup").popup("close");
//--            });
        });
        return;
    }
    
//-- !!!DEPRECATED    
//--    if (id === 'settingitem_engineservice')
//--    {
//--        //common.OpenWebURL(global.nativeplugin_path, stringres.get('np_download'));
//--        common.OpenWebURL(common.GetNPLocation(), stringres.get('np_download'));
//--        setTimeout(function ()
//--        {
//--            common.NPDownloadAndInstall();
//--        }, 150);
//--        return;
//--    }
    
    ismodified = true;
    
    if (id === 'settings_footer' || id === 'newuser_container') { return; } // don't handle Save/Cancel buttons
    global.wasSettModified = true;
    
    var mCurrSettName = id.replace('settingitem_', '');
    
    var value = common.settmap2[mCurrSettName];

    if( common.isNull(value) || value.length < 1 )
    {
        common.PutToDebugLog(2, 'ERROR, _settings OnListItemClick settings NULL');
        return;
    }

    var mSettValue = value[common.SETT_VALUE];
    var mSettType = value[common.SETT_TYPE];

    var mSettAllNames = value[common.SETT_ALLNAMES];
    var mSettAllValues = value[common.SETT_ALLVALUES];
    var mSettGrouping =  value[common.SETT_GROUP];
    var settDisplayName = stringres.get('sett_display_name_'+mCurrSettName);
    var settComment = stringres.get('sett_comment_'+mCurrSettName);
    
    if (common.GetConfigInt('brandid', -1) === 50) // favafone
    {
        if (mCurrSettName === 'sipusername') { settComment = 'Your Favafone Username'; }
        if (mCurrSettName === 'password') { settComment = 'Your Favafone Password'; }
    }
    
    if (mSettType === null || mSettType.length <= 0 || (mSettType !== '0' && mSettType !== '1' && mSettType !== '2' && mSettType !== '3'
        && mSettType !== '4' && mSettType !== '5' && mSettType !== '6' && mSettType !== '7' && mSettType !== '8'))
    {
        common.PutToDebugLog(2, 'ERROR, _settings OnListItemClick invalid type');
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
    
//type 0 = checkbox
    if (mSettType === '0')
    {
        if (mCurrSettName === 'loglevel')
        {
            if (mSettValue === '1')
            {
                mSettValue = global.predefLoglevel;
                var maxl = common.GetMaxLogLevel();
                if (mSettValue > maxl)
                {
                    mSettValue = maxl;
                }
                    
                common.SaveParameter('jsscriptevent', '3');
                webphone_api.setparameter('jsscriptevent', '3');
                common.SaveParameter('loglastusage', common.GetTickCount());
            }else
            {
                mSettValue = '1';
                
                common.SaveParameter('jsscriptevent', '2');
                webphone_api.setparameter('jsscriptevent', '2');
            }
            
            if (isSettLevelBasic === false) //-- repopulatelist to display/hide 'Set log/trace level' option
            {
                PopulateList();
            }
        }
//--         handle 2 as TRUE and 1 as FALSE
        else if (mCurrSettName === 'flash' || mCurrSettName === 'sscontrol' || mCurrSettName === 'ssscroll' || mCurrSettName === 'sstop')
        {
            if (mSettValue === '2') { mSettValue = '1'; }else{ mSettValue = '2'; }
        }
        else if (mCurrSettName === 'beeponincoming')
        {
            if (mSettValue === '1') { mSettValue = 'true'; }else{ mSettValue = 'false'; }
        }
        else
        {
            if (mSettValue === 'true')
            {
                mSettValue = 'false';
            }else
            {
                mSettValue = 'true';
            }
        }
        
//-- hide the startwithos option once it is already set
        if (mCurrSettName === 'startwithos')
        {
            common.SaveParameter('startwithos_was_sent', 'false');
        }

        var imgsrc = '';
        imgsrc = j$('#img_' + mCurrSettName).attr('src');

        if (common.isNull(imgsrc) || imgsrc.lenght < 1)
        {
            common.PutToDebugLog(2, 'ERROR, _settings imgsrc NULL');
            return;
        }
        
        if (imgsrc.indexOf('true') >= 0)
        {
            imgsrc = imgsrc.replace('true', 'false');
        }else
        {
            imgsrc = imgsrc.replace('false', 'true');
        }

        j$('#img_' + mCurrSettName).attr('src', imgsrc);
        
        value[common.SETT_VALUE] = mSettValue;
        value[common.SETT_ISDEFAULT] = '0';
        common.settmap[mCurrSettName] = value;
        common.settmap2[mCurrSettName] = value;
        
//-- repopulatelist to display/hide 'Set log/trace level' option
        if (mCurrSettName === 'loglevel')
        {
            if (isSettLevelBasic === false)
            {
                PopulateList();
            }
        }
        
        ShowSettValue(mCurrSettName);
    }

//type 1 = text box
    if (mSettType === '1')
    {
        var template = '' +
'<div id="settings_type_1" data-role="popup" class="ui-content messagePopup" data-overlay-theme="a" data-theme="a" style="max-width:' + popupWidth + 'px;">' +

    '<div data-role="header" data-theme="b">' +
        '<a href="javascript:;" data-role="button" data-icon="delete" data-iconpos="notext" class="ui-btn-right closePopup">Close</a>' +
        '<h1 class="adialog_title">' + settDisplayName + '</h1>' +
    '</div>' +
    '<div role="main" class="ui-content adialog_content">' +
        '<span>' + settComment + '</span>' +
        '<input type="text" id="setting_item_input" name="setting_item" data-theme="a" autocapitalize="off"/>' +
    '</div>' +
    '<div data-role="footer" data-theme="b" class="adialog_footer">' +
        '<a href="javascript:;" id="adialog_positive" class="ui-btn ui-corner-all ui-shadow ui-btn-inline ui-btn-b adialog_2button" data-rel="back" data-transition="flow">' + stringres.get('btn_ok') + '</a>' +
        '<a href="javascript:;" id="adialog_negative" class="ui-btn ui-corner-all ui-shadow ui-btn-inline ui-btn-b adialog_2button" data-rel="back">' + stringres.get('btn_cancel') + '</a>' +
    '</div>' +
'</div>';

        var popupafterclose = function () {};

        j$.mobile.activePage.append(template).trigger("create");
        //--j$.mobile.activePage.append(template).trigger("pagecreate");

//-- listen for enter onclick, and click OK button
//--        var xTriggered = 0;
//--        j$( "#settings_type_1" ).keypress(function( event )
//--        {
//--            //xTriggered++ ;
//--            if ( event.which === 13)
//--            {
//--                event.preventDefault();
//--                j$("#adialog_positive").click();
//--            }else
//--            {
//--                return;
//--            }
//--        });

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
        
        var initial_val = mSettValue;

        var textBox = document.getElementById('setting_item_input');

        if (!common.isNull(mSettValue) && mSettValue.length > 0 && !common.isNull(textBox))
        {
            if (mCurrSettName === 'password')
            {
                textBox.value = '*****';
            }
            else if ((mCurrSettName === 'ringtimeout' || mCurrSettName === 'calltimeout') && (mCurrSettName.length > 3))
            {
                mSettValue = mSettValue.substring(0, mSettValue.length - 3);
                textBox.value = mSettValue;
            }
// handle username / sipusername
            else if (mCurrSettName === 'sipusername')
            {
                if ((common.isNull(mSettValue) || mSettValue.length < 1) && common.GetParameter('username').length > 0)
                {
                    textBox.value = common.GetParameter('username');
                }else
                {
                    textBox.value = mSettValue;
                }
            }
            else if (mCurrSettName === 'loglevel_dbg')
            {
                mSettValue = common.GetParameter('loglevel');
                textBox.value = mSettValue;
            }
            else
            {
                textBox.value = mSettValue;
            }
        }

        setTimeout(function ()
        {
            if (!common.isNull(textBox)) { textBox.focus(); } // setting cursor to text input
        }, 150);
        

        j$('#adialog_positive').on('click', function (event)
        {
            if (common.GetBrowser() === 'MSIE') { event.preventDefault(); }

            common.PutToDebugLog(5,"EVENT, settings onListItemClick 1 ok (" + mCurrSettName + ")");
            
            ManuallyClosePopup(j$.mobile.activePage.find(".messagePopup"));

            var textBoxVal = '';
            if (!common.isNull(textBox)) { textBoxVal = textBox.value; }

            if (!common.isNull(textBoxVal)/* && textBoxVal.length > 0*/)
            {
                if (mCurrSettName === 'ringtimeout' || mCurrSettName === 'calltimeout')
                {
                    textBoxVal = textBoxVal + "000";
                }
                mSettValue = common.Trim(textBoxVal);

                if (mCurrSettName === 'sipusername')
                {
                    mSettValue = common.NormalizeInput(mSettValue, 0);
                    var callerid = common.GetParameter('username');
                    if (common.isNull(callerid) || callerid.length < 1 ||
                            (!common.isNull(initial_val) && initial_val.length > 0 && initial_val !== mSettValue))
                    {
                        common.SaveParameter("username", mSettValue);
                    }
                }

                if (mCurrSettName === 'loglevel')
                {
                    if (common.isNull(mSettValue) || mSettValue.length < 1) { mSettValue = '1'; }
                    var valint = 1;
                    
                    try { valint = common.StrToInt(mSettValue); } catch(errinner) {  }
                    
                    global.loglevel = valint;
                }
                else if (mCurrSettName === 'loglevel_dbg')
                {
                    if (!common.isNull(mSettValue) && mSettValue.length > 0)
                    {
                        common.SaveParameter('loglevel', mSettValue);
                    }
                }

                if (mCurrSettName === 'password' && textBoxVal.indexOf('**') >= 0)
                {
                    return;
                }

                value[common.SETT_VALUE] = mSettValue;
                value[common.SETT_ISDEFAULT] = '0';
                common.settmap[mCurrSettName] = value;
                common.settmap2[mCurrSettName] = value;

                ShowSettValue(mCurrSettName);
            }
        });

        j$('#adialog_negative').on('click', function (event)
        {
            if (common.GetBrowser() === 'MSIE') { event.preventDefault(); }
            ManuallyClosePopup(j$.mobile.activePage.find(".messagePopup"));
        });
    }
    
//type 2 = drop down list
    if (mSettType === '2')
    {
        var allNames2 = mSettAllNames;
        var allValues2 = mSettAllValues;
        var allCount2 = 0;
           
        //getting values and names for combobox options
        var allNamesTmp2 = allNames2;
        while (allNamesTmp2.indexOf(',') > 0)	//get number of options
        {
            allNamesTmp2 = allNamesTmp2.substring(allNamesTmp2.indexOf(',')+1, allNamesTmp2.length);
            allCount2++;
        }
        allCount2++;
        var arrayNames2;
        var arrayValues2;

//-- used only for "transport" setting
//--        if (isSettLevelBasic && mCurrSettName === 'transport' && !common.isNull(mSettValue)
//--                && mSettValue.length > 0 && (mSettValue === '0' || mSettValue === '1'))
//--        {
//--            arrayNames2 = ['UDP', 'TCP'];
//--            arrayValues2 = ['0', '1'];
//--        }else
//--        {
            arrayNames2 = [];
            arrayValues2 = [];

            var countIdx2 = 0;
            allNamesTmp2 = allNames2;
            while (countIdx2 < allCount2)		//get options names in array
            {
                if (allNamesTmp2.indexOf(',') > 0)
                {
                    arrayNames2[countIdx2] = allNamesTmp2.substring(0, allNamesTmp2.indexOf(','));
                    allNamesTmp2 = allNamesTmp2.substring(allNamesTmp2.indexOf(',')+1, allNamesTmp2.length);
                }else
                {
                    arrayNames2[countIdx2] = allNamesTmp2.substring(0, allNamesTmp2.length);
                }
                countIdx2++;
            }

            countIdx2 = 0;
            var allValuesTmp2 = allValues2;
            while (countIdx2 < allCount2)		//get options values in array
            {
                if (allValuesTmp2.indexOf(',') > 0)
                {
                    arrayValues2[countIdx2] = allValuesTmp2.substring(0, allValuesTmp2.indexOf(','));
                    allValuesTmp2 = allValuesTmp2.substring(allValuesTmp2.indexOf(',')+1, allValuesTmp2.length);
                }else
                {
                    arrayValues2[countIdx2] = allValuesTmp2.substring(0, allValuesTmp2.length);
                }
                countIdx2++;
            }
//--        }

//showing options dialog
        var radiogroup = '';
        for (var i = 0; i < arrayNames2.length; i++)
        {
            var item = '<input name="' + mCurrSettName + '" id="[INPUTID]" value="[VALUE]" [CHECKED] type="radio">' +
                    '<label for="[INPUTID]">[LABEL]</label>';

            item = item.replace('[INPUTID]', mCurrSettName + '_' + i);
            item = item.replace('[INPUTID]', mCurrSettName + '_' + i); // twice
            item = item.replace('[VALUE]', arrayValues2[i]);
            item = item.replace('[LABEL]', arrayNames2[i]);
            
            if (arrayValues2[i] === mSettValue)
            {
                item = item.replace('[CHECKED]', 'checked="checked"');
            }else
            {            
                item = item.replace('[CHECKED]', '');
            }
            
            radiogroup = radiogroup + item;
        }
        
        var popupHeight = common.GetDeviceHeight();
        if ( !common.isNull(popupHeight) && common.IsNumber(popupHeight) && popupHeight > 100 )
        {
            popupHeight = Math.floor(popupHeight / 1.2);
        }else
        {
            popupHeight = 300;
        }
        
        var template = '' +
'<div id="settings_type_2" data-role="popup" class="ui-content messagePopup" data-overlay-theme="a" data-theme="a" style="max-width:' + popupWidth + 'px; min-width: ' + Math.floor(popupWidth * 0.6) + 'px;">' +

    '<div data-role="header" data-theme="b">' +
        '<a href="javascript:;" data-role="button" data-icon="delete" data-iconpos="notext" class="ui-btn-right closePopup">Close</a>' +
        '<h1 class="adialog_title">' + settDisplayName + '</h1>' +
    '</div>' +
    '<div role="main" class="ui-content adialog_content_select" style="max-height: ' + popupHeight + 'px;">' +
    
//'<form id="settings_select_2">' +
'<fieldset id="settings_select_2" data-role="controlgroup">' + radiogroup +
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
//--                j$('#adialog_positive').off('click');
//--                j$('#adialog_negative').off('click');
                popupafterclose();
            }
        });

//-- listen for enter onclick, and click OK button
//--     !!NOT WORKING
 //--       j$( "#settings_type_2" ).keypress(function( event )
//--        {
//--            if ( event.which === 13)
//--            {
//--                event.preventDefault();
//--                j$("#adialog_positive").click();
//--            }else
//--            {
//--                return;
//--            }
//--        });
        
        j$(":radio").on ("change", function (event)
        {
//--            alert (j$(this).attr ("id"));
//--            alert (j$(this).attr ("value"));
            ManuallyClosePopup(j$.mobile.activePage.find(".messagePopup"));
            
            j$.mobile.activePage.find(".messagePopup").popup("close");

            mSettValue = j$(this).attr ("value");
            
            if (common.IsWindowsSoftphone() && common.GetConfig('needactivation') == 'true' && common.GetParameter('canshowlickeyinput') !== 'true'
                    && ( (mCurrSettName === 'transport' && mSettValue === '2') || (mCurrSettName === 'mediaencryption' && mSettValue === '2') ))
            {
                common.ShowToast(stringres.get('warning_feature'), 6000);
                return;
            }
            
            value[common.SETT_VALUE] = mSettValue;
            value[common.SETT_ISDEFAULT] = '0';
            common.settmap[mCurrSettName] = value;
            common.settmap2[mCurrSettName] = value;
            
            ShowSettValue(mCurrSettName);
            
            if (mCurrSettName === 'theme')
            {
                common.SetCurrTheme();
                
                if (common.IsWindowsSoftphone())
                {
                    var url = common.AddJscommport(global.WIN_SOFTPHONE_URL) + '?extcmd_theme=' + mSettValue;
                    common.WinSoftphoneHttpReq(url, 'GET', '', function (resp) { common.PutToDebugLog(2, 'EVENT, send theme to softphone response: ' + resp); });
                }
            }
            else if (mCurrSettName === 'language')
            {
                common.SetLanguage();
            }
        });
    }

//type 3 = drop down list and checkbox - only for codec !!!
    if (mSettType === '3')
    {
        if (mCurrSettName === 'videocodec')
        {
            var radiogroup = ''+
                '<input name="' + mCurrSettName + '" id="videocodec_optimal" [CHECKED_OPTIMAL] type="checkbox">' +
                    '<label for="videocodec_optimal">' + stringres.get('videocodec_optimal') + '</label>' +

                '<input name="' + mCurrSettName + '" id="videocodec_h264" [CHECKED_H264] type="checkbox">' +
                    '<label for="videocodec_h264">H264</label>' +

                '<input name="' + mCurrSettName + '" id="videocodec_vp8" [CHECKED_VP8] type="checkbox">' +
                    '<label for="videocodec_vp8">VP8</label>' +

                '<input name="' + mCurrSettName + '" id="videocodec_vp9" [CHECKED_VP9] type="checkbox">' +
                    '<label for="videocodec_vp9">VP9</label>';
            
            if (mSettValue === '-1') // means optimal
            {
                radiogroup = radiogroup.replace('[CHECKED_OPTIMAL]', 'checked="checked"');
                radiogroup = radiogroup.replace('[CHECKED_H264]', '');
                radiogroup = radiogroup.replace('[CHECKED_VP8]', '');
                radiogroup = radiogroup.replace('[CHECKED_VP9]', '');
            }else
            {
                radiogroup = radiogroup.replace('[CHECKED_OPTIMAL]', '');
                
                var ch_h264 = 'checked="checked"'; if (common.GetParameterBool('use_h264', true) === false) { ch_h264 = ''; }
                radiogroup = radiogroup.replace('[CHECKED_H264]', ch_h264);
                
                var ch_vp8 = 'checked="checked"'; if (common.GetParameterBool('use_vp8', true) === false) { ch_vp8 = ''; }
                radiogroup = radiogroup.replace('[CHECKED_VP8]', ch_vp8);
                
                var ch_vp9 = 'checked="checked"'; if (common.GetParameterBool('use_vp9', true) === false) { ch_vp9 = ''; }
                radiogroup = radiogroup.replace('[CHECKED_VP9]', ch_vp9);
            }
            
            var template = '' +
    '<div id="settings_type_3" data-role="popup" class="ui-content messagePopup" data-overlay-theme="a" data-theme="a" data-dismissible="false" style="max-width:' + popupWidth + 'px; min-width: ' + Math.floor(popupWidth * 0.6) + 'px;">' +

        '<div data-role="header" data-theme="b">' +
//--            '<a href="javascript:;" data-role="button" data-icon="delete" data-iconpos="notext" class="ui-btn-right closePopup">Close</a>' +
            '<h1 class="adialog_title">' + settDisplayName + '</h1>' +
        '</div>' +
        '<div role="main" class="ui-content adialog_content_select">' +

//    '<form id="settings_select_2">' +
    '<fieldset id="settings_select_3" data-role="controlgroup">' + radiogroup +

    //    '<legend>Select transport layer protocol</legend>' +
    //    '<input name="radio-choice-v-2" id="radio-choice-v-2a" value="on" checked="checked" type="checkbox">' +
    //    '<label for="radio-choice-v-2a">One</label>' +
    //    '<input name="radio-choice-v-2" id="radio-choice-v-2b" value="off" type="checkbox">' +
    //    '<label for="radio-choice-v-2b">Two</label>' +

    '</fieldset>' +
    //'</form>' +

        '</div>' +
        '<div data-role="footer" data-theme="b" class="adialog_footer">' +
        '<a href="javascript:;" style="width: 98%;" id="adialog_positive" class="ui-btn ui-corner-all ui-shadow ui-btn-inline ui-btn-b adialog_2button" data-rel="back" data-transition="flow">' + stringres.get('btn_ok') + '</a>' +
        '</div>' +
    '</div>';

            var popupafterclose = function () {};

            j$.mobile.activePage.append(template).trigger("create");
//--            j$.mobile.activePage.append(template).trigger("pagecreate");

            j$.mobile.activePage.find(".closePopup").bind("tap", function (e)
            {
                j$.mobile.activePage.find(".messagePopup").popup("close");
            });

            j$.mobile.activePage.find(".messagePopup").bind(
            {
                popupbeforeposition: function()
                {
                    j$(this).unbind("popupbeforeposition");//.remove();
                    var maxHeight =  Math.floor( common.GetDeviceHeight() * 0.7 );  // j$(window).height() - 120;

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
                    j$('#adialog_positive').off('click');
//--                    j$('#adialog_negative').off('click');
                    popupafterclose();
                }
            });

//--     listen for enter onclick, and click OK button
//--     !!NOT WORKING
//--            j$( "#settings_type_3" ).keypress(function( event )
//--            {
//--                if ( event.which === 13)
//--                {
//--                    event.preventDefault();
//--                    j$("#adialog_positive").click();
//--                }else
//--                {
//--                    return;
//--                }
//--            });


            j$(":checkbox").on ("change", function (event)
            {
                var chid = j$(this).attr ("id");
                if (chid === 'videocodec_optimal')
                {
                    j$('#videocodec_h264').prop("checked", false).checkboxradio("refresh");
                    j$('#videocodec_vp8').prop("checked", false).checkboxradio("refresh");
                    j$('#videocodec_vp9').prop("checked", false).checkboxradio("refresh");
                }else
                {
                    j$('#videocodec_optimal').prop("checked", false).checkboxradio("refresh");
                }
            });

            j$('#adialog_positive').on('click', function (event)
            {
                if (common.GetBrowser() === 'MSIE') { event.preventDefault(); }

                common.PutToDebugLog(5,"EVENT, settings onListItemClick videocodec ok");

                ManuallyClosePopup(j$.mobile.activePage.find(".messagePopup"));

                mSettValue = '';

                if ( j$('#videocodec_optimal').prop("checked") )
                {
                    mSettValue = '-1';

                    common.SaveParameter('use_h264', 'true');
                    common.SaveParameter('use_vp8', 'true');
                    common.SaveParameter('use_vp9', 'true');
                }else
                {
                    mSettValue = '1'; // vagy akarmilyen mas ertek, mint -1
                    
                    var  cdh264 = 'false'; if ( j$('#videocodec_h264').prop("checked") ) { cdh264 = 'true'; }
                    common.SaveParameter('use_h264', cdh264);
                    
                    var  cdvp8 = 'false'; if ( j$('#videocodec_vp8').prop("checked") ) { cdvp8 = 'true'; }
                    common.SaveParameter('use_vp8', cdvp8);
                    
                    var  cdvp9 = 'false'; if ( j$('#videocodec_vp9').prop("checked") ) { cdvp9 = 'true'; }
                    common.SaveParameter('use_vp9', cdvp9);
                }
                
                value[common.SETT_VALUE] = mSettValue;
                value[common.SETT_ISDEFAULT] = '0';
                common.settmap[mCurrSettName] = value;
                common.settmap2[mCurrSettName] = value;

                ShowSettValue(mCurrSettName);
            });
        }
        else if (mCurrSettName === 'codec')
        {
            var allNames3 = mSettAllNames;
            var allValues3 = mSettAllValues;

            var arrayNames3 = allNames3.split(",");	//--Optimal,1,PCMU,1,PCMA,1,GSM,1,iLBC,0,SPEEX,0,SPEEX-WB,0,0,G.729,0
            var arrayValues3 = allValues3.split(",");

            var arraySelectedValues3 = mSettValue.split(",");

            for (var k = 0; k < arraySelectedValues3.length; k++)
            {
                if (arraySelectedValues3[k] === '-1')
                {
                    arraySelectedValues3 = ['-1'];
                    break;
                }
            }

            var radiogroup = '';

            for (var i = 0; i < arrayNames3.length; i++)
            {

                var item = '<input name="' + mCurrSettName + '" id="[INPUTID]" value="[VALUE]" [CHECKED] type="checkbox">' +
                        '<label for="[INPUTID]">[LABEL]</label>';

                item = item.replace('[INPUTID]', mCurrSettName + '_' + i);
                item = item.replace('[INPUTID]', mCurrSettName + '_' + i); //-- twice
                item = item.replace('[VALUE]', arrayValues3[i]);
                item = item.replace('[LABEL]', arrayNames3[i]);

                if (arrayNames3[i] === 'Optimal')
                {
                    for (var j = 0; j < arraySelectedValues3.length; j++)
                    {
                        if (arraySelectedValues3[j] === '-1') { item = item.replace('[CHECKED]', 'checked="checked"'); break; }
                    }
                    item = item.replace('[CHECKED]', '');
                    radiogroup = radiogroup + item;
                }

                if (arrayNames3[i] === 'PCMU')
                {
                    for (var j = 0; j < arraySelectedValues3.length; j++)
                    {
                        if (arraySelectedValues3[j] === '1') {  item = item.replace('[CHECKED]', 'checked="checked"'); break;  }
                    }
                    item = item.replace('[CHECKED]', '');
                    radiogroup = radiogroup + item;
                }
                if (arrayNames3[i] === 'PCMA')
                {
                    for (var j = 0; j < arraySelectedValues3.length; j++)
                    {
                        if (arraySelectedValues3[j] === '2') { item = item.replace('[CHECKED]', 'checked="checked"'); break; }
                    }
                    item = item.replace('[CHECKED]', '');
                    radiogroup = radiogroup + item;
                }
                if (arrayNames3[i] === 'GSM')
                {
                    for (var j = 0; j < arraySelectedValues3.length; j++)
                    {
                        if (arraySelectedValues3[j] === '3') { item = item.replace('[CHECKED]', 'checked="checked"'); break; }
                    }
                    item = item.replace('[CHECKED]', '');
                    radiogroup = radiogroup + item;
                }
                if (arrayNames3[i] === 'iLBC')
                {
                    for (var j = 0; j < arraySelectedValues3.length; j++)
                    {
                        if (arraySelectedValues3[j] === '4') { item = item.replace('[CHECKED]', 'checked="checked"'); break; }
                    }
                    item = item.replace('[CHECKED]', '');
                    radiogroup = radiogroup + item;
                }
                if (arrayNames3[i] === 'SPEEX')
                {
                    for (var j = 0; j < arraySelectedValues3.length; j++)
                    {
                        if (arraySelectedValues3[j] === '5') { item = item.replace('[CHECKED]', 'checked="checked"'); break; }
                    }
                    item = item.replace('[CHECKED]', '');
                    radiogroup = radiogroup + item;
                }
                if (arrayNames3[i] === 'SPEEX-WB')
                {
                    for (var j = 0; j < arraySelectedValues3.length; j++)
                    {
                        if (arraySelectedValues3[j] === '6') { item = item.replace('[CHECKED]', 'checked="checked"'); break; }
                    }
                    item = item.replace('[CHECKED]', '');
                    radiogroup = radiogroup + item;
                }

                if (arrayNames3[i] === 'Opus')
                {
                    for (var j = 0; j < arraySelectedValues3.length; j++)
                    {
                        if (arraySelectedValues3[j] === '6') { item = item.replace('[CHECKED]', 'checked="checked"'); break; }
                    }
                    item = item.replace('[CHECKED]', '');
                    radiogroup = radiogroup + item;
                }
                if (arrayNames3[i] === 'OpusWB')
                {
                    for (var j = 0; j < arraySelectedValues3.length; j++)
                    {
                        if (arraySelectedValues3[j] === '6') { item = item.replace('[CHECKED]', 'checked="checked"'); break; }
                    }
                    item = item.replace('[CHECKED]', '');
                    radiogroup = radiogroup + item;
                }
                if (arrayNames3[i] === 'OpusSWB')
                {
                    for (var j = 0; j < arraySelectedValues3.length; j++)
                    {
                        if (arraySelectedValues3[j] === '6') { item = item.replace('[CHECKED]', 'checked="checked"'); break; }
                    }
                    item = item.replace('[CHECKED]', '');
                    radiogroup = radiogroup + item;
                }
                if (arrayNames3[i] === 'OpusUWB')
                {
                    for (var j = 0; j < arraySelectedValues3.length; j++)
                    {
                        if (arraySelectedValues3[j] === '6') { item = item.replace('[CHECKED]', 'checked="checked"'); break; }
                    }
                    item = item.replace('[CHECKED]', '');
                    radiogroup = radiogroup + item;
                }

                if (arrayNames3[i] === 'G.729')
                {
                    for (var j = 0; j < arraySelectedValues3.length; j++)
                    {
                        if (arraySelectedValues3[j] === '8') { item = item.replace('[CHECKED]', 'checked="checked"'); break; }
                    }
                    item = item.replace('[CHECKED]', '');
                    radiogroup = radiogroup + item;
                }
            }


            var template = '' +
    '<div id="settings_type_3" data-role="popup" class="ui-content messagePopup" data-overlay-theme="a" data-theme="a" data-dismissible="false" style="max-width:' + popupWidth + 'px; min-width: ' + Math.floor(popupWidth * 0.6) + 'px;">' +

        '<div data-role="header" data-theme="b">' +
    //--        '<a href="javascript:;" data-role="button" data-icon="delete" data-iconpos="notext" class="ui-btn-right closePopup">Close</a>' +
            '<h1 class="adialog_title">' + settDisplayName + '</h1>' +
        '</div>' +
        '<div role="main" class="ui-content adialog_content_select">' +

    //'<form id="settings_select_2">' +
    '<fieldset id="settings_select_3" data-role="controlgroup">' + radiogroup +

    //    '<legend>Select transport layer protocol</legend>' +
    //    '<input name="radio-choice-v-2" id="radio-choice-v-2a" value="on" checked="checked" type="checkbox">' +
    //    '<label for="radio-choice-v-2a">One</label>' +
    //    '<input name="radio-choice-v-2" id="radio-choice-v-2b" value="off" type="checkbox">' +
    //    '<label for="radio-choice-v-2b">Two</label>' +

    '</fieldset>' +
    //'</form>' +

        '</div>' +
        '<div data-role="footer" data-theme="b" class="adialog_footer">' +
        '<a href="javascript:;" style="width: 98%;" id="adialog_positive" class="ui-btn ui-corner-all ui-shadow ui-btn-inline ui-btn-b adialog_2button" data-rel="back" data-transition="flow">' + stringres.get('btn_ok') + '</a>' +
        '</div>' +
    '</div>';

            var popupafterclose = function () {};

            j$.mobile.activePage.append(template).trigger("create");
//--            j$.mobile.activePage.append(template).trigger("pagecreate");

            j$.mobile.activePage.find(".closePopup").bind("tap", function (e)
            {
                j$.mobile.activePage.find(".messagePopup").popup("close");
            });

            j$.mobile.activePage.find(".messagePopup").bind(
            {
                popupbeforeposition: function()
                {
                    j$(this).unbind("popupbeforeposition");//--.remove();
                    var maxHeight =  Math.floor( common.GetDeviceHeight() * 0.7 );  //-- j$(window).height() - 120;

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
                    j$('#adialog_positive').off('click');
//--                    j$('#adialog_negative').off('click');
                    popupafterclose();
                }
            });

//--    listen for enter onclick, and click OK button
//--     !!NOT WORKING
//--            j$( "#settings_type_3" ).keypress(function( event )
//--            {
//--                if ( event.which === 13)
//--                {
//--                    event.preventDefault();
//--                    j$("#adialog_positive").click();
//--                }else
//--                {
//--                    return;
//--                }
//--            });


            j$(":checkbox").on ("change", function (event)
            {
//--                alert (j$(this).attr ("id"));
//--                alert (j$(this).attr ("value"));
                var val = j$(this).attr ("value");
                if (val === '-1')
                {
                    if ( j$('#' + mCurrSettName + '_0').prop("checked") ) // if optimal is checked
                    {
                        for (var i = 1; i < arrayNames3.length; i++)
                        {
                            j$('#' + mCurrSettName + '_' + i).prop("checked", false).checkboxradio("refresh");
                        }
                    }else // if optimal is unchecked
                    {
                        for (var i = 0; i < arrayNames3.length; i++)
                        {
                            if (arrayNames3[i] === 'PCMU' || arrayNames3[i] === 'PCMA' || arrayNames3[i] === 'GSM')
                            {
                                j$('#' + mCurrSettName + '_' + i).prop("checked", true).checkboxradio("refresh");
                            }    
                        }
                    }
                }else
                {
                    if (val === '8' && common.IsWindowsSoftphone() && common.GetConfig('needactivation') == 'true'
                        && common.GetParameter('canshowlickeyinput') !== 'true')
                    {
//--                        setTimeout(function ()
//--                        {
                            j$('#' + mCurrSettName + '_7').prop("checked", false).checkboxradio("refresh");
                            j$.mobile.activePage.find(".messagePopup").popup("close");
//--                        }, 200);
                        setTimeout(function () { common.ShowToast(stringres.get('warning_feature'), 6000); }, 100);
                        return;
                    }

                    j$('#' + mCurrSettName + '_0').prop("checked", false).checkboxradio("refresh");
                }
            });

            j$('#adialog_positive').on('click', function (event)
            {
                if (common.GetBrowser() === 'MSIE') { event.preventDefault(); }

                common.PutToDebugLog(5,"EVENT, settings onListItemClick 3 ok");

                ManuallyClosePopup(j$.mobile.activePage.find(".messagePopup"));

                mSettValue = '';

                for (var i = 0; i < arrayNames3.length; i++)
                {
                    if ( j$('#' + mCurrSettName + '_' + i).prop("checked") )
                    {
                        var sep = '';
                        if (mSettValue.length > 0)
                        {
                            sep = ',';
                        }

                        mSettValue = mSettValue + sep + document.getElementById(mCurrSettName + '_' + i).value;
                    }
                }
                value[common.SETT_VALUE] = mSettValue;
                value[common.SETT_ISDEFAULT] = '0';
                common.settmap[mCurrSettName] = value;
                common.settmap2[mCurrSettName] = value;

                ShowSettValue(mCurrSettName);
            });
        }
        
    }
    
//type 4 = seek bar (not implemented yet)
    if (mSettType === '4')
    {
        var template = '' +
'<div id="settings_type_4" data-role="popup" class="ui-content messagePopup" data-overlay-theme="a" data-theme="a" style="max-width:' + popupWidth + 'px;">' +

    '<div data-role="header" data-theme="b">' +
        '<a href="javascript:;" data-role="button" data-icon="delete" data-iconpos="notext" class="ui-btn-right closePopup">Close</a>' +
        '<h1 class="adialog_title">' + settDisplayName + '</h1>' +
    '</div>' +
    '<div role="main" class="ui-content adialog_content">' +
        '<span>' + settComment + '</span>' +
        '<input type="text" id="setting_item_input" name="setting_item" data-theme="a" autocapitalize="off"/>' +
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
        
//-- listen for enter onclick, and click OK button
 //--       j$( "#settings_type_4" ).keypress(function( event )
//--        {
//--            if ( event.which === 13)
//--            {
//--                event.preventDefault();
//--                j$("#adialog_positive").click();
//--            }else
//--            {
//--                return;
//--            }
//--        });

        var textBox = document.getElementById('setting_item_input');

        if (!common.isNull(mSettValue) && mSettValue.length > 0 && !common.isNull(textBox))
        {
            if ((mCurrSettName === 'ringtimeout' || mCurrSettName === 'calltimeout') && (mCurrSettName.length > 3))
            {
                mSettValue = mSettValue.substring(0, mSettValue.length - 3);
                textBox.value = mSettValue;
            }else
            {
                textBox.value = mSettValue;
            }
        }

        setTimeout(function ()
        {
            if (!common.isNull(textBox)) { textBox.focus(); } // setting cursor to text input
        }, 150);

        j$('#adialog_positive').on('click', function (event)
        {
            if (common.GetBrowser() === 'MSIE') { event.preventDefault(); }

            common.PutToDebugLog(5,"EVENT, settings onListItemClick 2 ok (" + mSettValue + ")");
            
            ManuallyClosePopup(j$.mobile.activePage.find(".messagePopup"));

            var textBoxVal = '';
            if (!common.isNull(textBox)) { textBoxVal = textBox.value; }

            if (!common.isNull(textBoxVal) && textBoxVal.length > 0)
            {
                mSettValue = common.Trim(textBoxVal);

                value[common.SETT_VALUE] = mSettValue;
                value[common.SETT_ISDEFAULT] = '0';
                common.settmap2[mCurrSettName] = value;
                
                ShowSettValue(mCurrSettName);
            }
        });

        j$('#adialog_negative').on('click', function (event)
        {
            if (common.GetBrowser() === 'MSIE') { event.preventDefault(); }
            ManuallyClosePopup(j$.mobile.activePage.find(".messagePopup"));
        });
    }
    
//type 5 = open new activity
    if (mSettType === '5') //-- TODO: not implemented
    {
        if (mCurrSettName === 'filters')
        {
            //global.intentfiletransfer[0] = 'destination=' + destination;

            j$.mobile.changePage("#page_filters", { transition: "slide", role: "page" });
        }
        else if (mCurrSettName === 'accounts')
        {
            j$.mobile.changePage("#page_accounts", { transition: "slide", role: "page" });
        }else
        {
            alert('not implemented yet');
        }
    }
    
    
//6 = submenu
    if (mSettType === '6')	//submenu_sipsettings,submenu_media,submenu_integrate,submenu_calldivert,submenu_general,submenu_integrate
    {
//--        j$('#app_name_settings').hide();
        
        if (mCurrSettName === 'submenu_sipsettings')
        {
            currGroup = common.StrToInt( common.Trim(common.GROUP_SIP) );
            PopulateList();
            j$('#btn_back_settings').show();
            j$('#app_name_settings').hide();
            
            j$('#settings_page_title').html( settDisplayName );
            j$('#btn_back_settings').html( '<b>&LT;</b>&nbsp;' + stringres.get("settings_title") );
        }
        else if (mCurrSettName === 'submenu_media')
        {
            currGroup = common.StrToInt( common.Trim(common.GROUP_MEDIA) );
            PopulateList();
            j$('#btn_back_settings').show();
            j$('#app_name_settings').hide();

            j$('#settings_page_title').html( settDisplayName );
            j$('#btn_back_settings').html( '<b>&LT;</b>&nbsp;' + stringres.get("settings_title") );
        }
        else if (mCurrSettName === 'submenu_video') 
        {
            currGroup = common.StrToInt( common.Trim(common.GROUP_VIDEO) );
            PopulateList();
            j$('#btn_back_settings').show();
            j$('#app_name_settings').hide();

            j$('#settings_page_title').html( settDisplayName );
            j$('#btn_back_settings').html( '<b>&LT;</b>&nbsp;' + stringres.get("sett_display_name_submenu_media") );
        }
        else if (mCurrSettName === 'submenu_calldivert')
        {
            currGroup = common.StrToInt( common.Trim(common.GROUP_CALLDIVERT) );
            PopulateList();
            j$('#btn_back_settings').show();
            j$('#app_name_settings').hide();

            j$('#settings_page_title').html( settDisplayName );
            j$('#btn_back_settings').html( '<b>&LT;</b>&nbsp;' + stringres.get("settings_title") );
        }
        else if (mCurrSettName === 'submenu_general') 
        {
            currGroup = common.StrToInt( common.Trim(common.GROUP_GENERAL) );
            PopulateList();
            j$('#btn_back_settings').show();
            j$('#app_name_settings').hide();

            j$('#settings_page_title').html( settDisplayName );
            j$('#btn_back_settings').html( '<b>&LT;</b>&nbsp;' + stringres.get("settings_title") );
        }
        else if (mCurrSettName === 'submenu_integrate') 
        {
            currGroup = common.StrToInt( common.Trim(common.GROUP_INTEGRATE) );
            PopulateList();
            j$('#btn_back_settings').show();
            j$('#app_name_settings').hide();

            j$('#settings_page_title').html( settDisplayName );
            j$('#btn_back_settings').html( '<b>&LT;</b>&nbsp;' + stringres.get("settings_title") );
        }
        else if (mCurrSettName === 'submenu_screenshare') 
        {
            currGroup = common.StrToInt( common.Trim(common.GROUP_SCRSHARE) );
            PopulateList();
            j$('#btn_back_settings').show();
            j$('#app_name_settings').hide();

            j$('#settings_page_title').html( settDisplayName );
            j$('#btn_back_settings').html( '<b>&LT;</b>&nbsp;' + stringres.get("settings_title") );
        }
        else if (mCurrSettName === 'submenu_advanced_artcl') // customized for ARTCL
        {
            j$('#btn_back_settings').show();
            j$('#app_name_settings').hide();
            currGroup = 6;
            PopulateList();
        }
    }
    
// 7 = drop down list from XML string-array
    if (mSettType === '7') //-- TODO: not implemented yet
    {
        alert('not implemented yet');
    }
    
// custom
    if (mSettType === '8')
    {
        
//audiodevices
        if (mCurrSettName === 'audiodevices')
        {
            common.AlertDialog(stringres.get('sett_display_name_audiodevices'), stringres.get('sett_comment_audiodevices'));
        }

//reset_settings
        if (mCurrSettName === 'reset_settings')
        {
            var template = '' +
'<div data-role="popup" class="ui-content messagePopup" data-overlay-theme="a" data-theme="a" style="max-width:' + popupWidth + 'px;">' +

    '<div data-role="header" data-theme="b">' +
        '<a href="javascript:;" data-role="button" data-icon="delete" data-iconpos="notext" class="ui-btn-right closePopup">Close</a>' +
        '<h1 class="adialog_title">' + settDisplayName + '</h1>' +
    '</div>' +
    '<div role="main" class="ui-content adialog_content">' +
        '<span>' + stringres.get('reset_settings_msg') + '</span>' +
//--        '<input type="text" id="setting_item_input" name="setting_item" data-theme="a"/>' +
    '</div>' +
    '<div data-role="footer" data-theme="b" class="adialog_footer">' +
        '<a href="javascript:;" id="adialog_positive" class="ui-btn ui-corner-all ui-shadow ui-btn-inline ui-btn-b adialog_2button" data-rel="back" data-transition="flow">' + stringres.get('btn_ok') + '</a>' +
        '<a href="javascript:;" id="adialog_negative" class="ui-btn ui-corner-all ui-shadow ui-btn-inline ui-btn-b adialog_2button" data-rel="back">' + stringres.get('btn_cancel') + '</a>' +
    '</div>' +
'</div>';

            var popupafterclose = function () {};

            j$.mobile.activePage.append(template).trigger("create");
//--            j$.mobile.activePage.append(template).trigger("pagecreate");

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

            j$('#adialog_positive').on('click', function (event)
            {
                if (common.GetBrowser() === 'MSIE') { event.preventDefault(); }

                common.PutToDebugLog(5,"EVENT, settings onListItemClick Reset Settings ok");
                
                ManuallyClosePopup(j$.mobile.activePage.find(".messagePopup"));
                
                var usernameTemp = common.GetParameter('username');
                var passwordTemp = common.GetParameter('password');
                var serveraddress_origTemp = common.GetParameter('serveraddress_orig');
                var serveraddress_userTemp = common.GetParameter('serveraddress_user');

                var proxyaddressTemp = common.GetParameter('proxyaddress');
                var sipusernameTemp = common.GetParameter('sipusername');
                var displaynameTemp = common.GetParameter('displayname');
                var emailTemp = common.GetParameter('email');
                var voicemailTemp = common.GetParameter('voicemailnum');
                var forwardnumberTemp = common.GetParameter('callforwardonbusy');

//--                 TODO: delete settings file if exists
//--                if (CommonGUI.FileExists(common.GetActiveAccSettingsFileName()))
//--                {
//--                        CommonGUI.DeleteTextFile(common.GetActiveAccSettingsFileName());
//--                }
                
                for (var key in common.settmap)
                {
                    delete common.settmap[key];
                }
                for (var key in common.settmap2)
                {
                    delete common.settmap2[key];
                }

//--###AKOSSETT                common.InitializeSettings();
                common.HandleSettings('', '', function () { ; });
                
                common.SaveParameter('username', usernameTemp);
                common.SaveParameter('password', passwordTemp);
                common.SaveParameter('serveraddress_orig', serveraddress_origTemp);
                common.SaveParameter('serveraddress_user', serveraddress_userTemp);

                common.SaveParameter('proxyaddress', proxyaddressTemp);
                common.SaveParameter('sipusername', sipusernameTemp);
                common.SaveParameter('displayname', displaynameTemp);
                common.SaveParameter('email', emailTemp);
                common.SaveParameter('voicemailnum', voicemailTemp);
                common.SaveParameter('callforwardonbusy', forwardnumberTemp);

                common.ShowToast(stringres.get('reset_settings_msg2'));
            });

            j$('#adialog_negative').on('click', function (event)
            {
                if (common.GetBrowser() === 'MSIE') { event.preventDefault(); }
                ManuallyClosePopup(j$.mobile.activePage.find(".messagePopup"));
            });
        }

// for aec
        if (mCurrSettName === 'aec')
        {
            var cbAuto = '';
            var cbNone = '';
            var cbSoftware = '';
            var cbNative = '';
            var cbFast = '';
            var cbDecreaseVolume = '';
            
            var listTmp = mSettValue.split(',');
            	
            for (var i = 0; i < listTmp.length; i++)
            {
                if (listTmp[i] === '-1')    cbAuto = 'checked="checked"';
                if (listTmp[i] === '0')     cbNone = 'checked="checked"';
                if (listTmp[i] === '1')     cbSoftware = 'checked="checked"';
                if (listTmp[i] === '2')     cbNative = 'checked="checked"';
                if (listTmp[i] === '3')     cbFast = 'checked="checked"';
                if (listTmp[i] === '4')     cbDecreaseVolume = 'checked="checked"';
            }
            
            var template = '' +
    '<div id="settings_type_aec" data-role="popup" class="ui-content messagePopup" data-overlay-theme="a" data-theme="a" data-dismissible="false" style="max-width:' + popupWidth + 'px; min-width: ' + Math.floor(popupWidth * 0.6) + 'px;">' +

        '<div data-role="header" data-theme="b">' +
//--            '<a href="javascript:;" data-role="button" data-icon="delete" data-iconpos="notext" class="ui-btn-right closePopup">Close</a>' +
            '<h1 class="adialog_title">' + settDisplayName + '</h1>' +
        '</div>' +
        '<div role="main" class="ui-content adialog_content_select">' +

//--    '<form id="settings_select_2">' +
    '<fieldset id="settings_select_3" data-role="controlgroup">' +
//--        '<legend>Select transport layer protocol</legend>' +
        '<input name="' + mCurrSettName + '" id="aec_auto" ' + cbAuto + ' type="checkbox">' +
        '<label for="aec_auto">' + stringres.get('aec_auto') + '</label>' +
        
        '<input name="' + mCurrSettName + '" id="aec_none" ' + cbNone + ' type="checkbox">' +
        '<label for="aec_none">' + stringres.get('aec_none') + '</label>' +
        
        '<input name="' + mCurrSettName + '" id="aec_software" ' + cbSoftware + ' type="checkbox">' +
        '<label for="aec_software">' + stringres.get('aec_software') + '</label>' +
        
        '<input name="' + mCurrSettName + '" id="aec_native" ' + cbNative + ' type="checkbox">' +
        '<label for="aec_native">' + stringres.get('aec_native') + '</label>' +
        
        '<input name="' + mCurrSettName + '" id="aec_fast" ' + cbFast + ' type="checkbox">' +
        '<label for="aec_fast">' + stringres.get('aec_fast') + '</label>' +
        
        '<input name="' + mCurrSettName + '" id="aec_decrease_volume" ' + cbDecreaseVolume + ' type="checkbox">' +
        '<label for="aec_decrease_volume">' + stringres.get('aec_decrease_volume') + '</label>' +

    '</fieldset>' +
//--    '</form>' +

        '</div>' +
        '<div data-role="footer" data-theme="b" class="adialog_footer">' +
        '<a href="javascript:;" style="width: 98%;" id="adialog_positive" class="ui-btn ui-corner-all ui-shadow ui-btn-inline ui-btn-b adialog_2button" data-rel="back" data-transition="flow">' + stringres.get('btn_ok') + '</a>' +
        '</div>' +
    '</div>';

            var popupafterclose = function () {};

            j$.mobile.activePage.append(template).trigger("create");
//--            j$.mobile.activePage.append(template).trigger("pagecreate");
            
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
    //                j$('#adialog_negative').off('click');
                    popupafterclose();
                }
            });

//-- listen for enter onclick, and click OK button
//-- !!NOT WORKING
//--            j$( "#settings_type_aec" ).keypress(function( event )
//--            {
//--                if ( event.which === 13)
//--                {
//--                    event.preventDefault();
//--                    j$("#adialog_positive").click();
//--                }else
//--                {
//--                    return;
//--                }
//--            });

            j$(":checkbox").on ("change", function (event)
            {
//--                alert (j$(this).attr ("id"));
//--                alert (j$(this).attr ("value"));
                var checkbox = j$(this).attr ("id");

                if (checkbox === 'aec_auto')
                {
                    if ( j$('#' + checkbox).prop("checked") )
                    {
                        j$('#aec_none').prop("checked", false).checkboxradio("refresh");
                        j$('#aec_software').prop("checked", false).checkboxradio("refresh");
                        j$('#aec_native').prop("checked", false).checkboxradio("refresh");
                        j$('#aec_fast').prop("checked", false).checkboxradio("refresh");
                        j$('#aec_decrease_volume').prop("checked", false).checkboxradio("refresh");
                    }
                }

                if (checkbox === 'aec_none')
                {
                    if ( j$('#' + checkbox).prop("checked") )
                    {
                        j$('#aec_auto').prop("checked", false).checkboxradio("refresh");
                        j$('#aec_software').prop("checked", false).checkboxradio("refresh");
                        j$('#aec_native').prop("checked", false).checkboxradio("refresh");
                        j$('#aec_fast').prop("checked", false).checkboxradio("refresh");
                        j$('#aec_decrease_volume').prop("checked", false).checkboxradio("refresh");
                    }else
                    {
                        j$('#aec_auto').prop("checked", true).checkboxradio("refresh");
                    }
                }
                
                if (checkbox === 'aec_software')
                {
                    if ( j$('#' + checkbox).prop("checked") )
                    {
                        j$('#aec_auto').prop("checked", false).checkboxradio("refresh");
                        j$('#aec_none').prop("checked", false).checkboxradio("refresh");
                    }
                    else if ( j$('#aec_native').prop("checked") === false && j$('#aec_fast').prop("checked") === false
                            && j$('#aec_decrease_volume').prop("checked") === false )
                    {
                        j$('#aec_auto').prop("checked", true).checkboxradio("refresh");
                    }
                }

                if (checkbox === 'aec_native')
                {
                    if ( j$('#' + checkbox).prop("checked") )
                    {
                        j$('#aec_auto').prop("checked", false).checkboxradio("refresh");
                        j$('#aec_none').prop("checked", false).checkboxradio("refresh");
                    }
                    else if ( j$('#aec_software').prop("checked") === false && j$('#aec_fast').prop("checked") === false
                            && j$('#aec_decrease_volume').prop("checked") === false )
                    {
                        j$('#aec_auto').prop("checked", true).checkboxradio("refresh");
                    }
                }
                
                if (checkbox === 'aec_fast')
                {
                    if ( j$('#' + checkbox).prop("checked") )
                    {
                        j$('#aec_auto').prop("checked", false).checkboxradio("refresh");
                        j$('#aec_none').prop("checked", false).checkboxradio("refresh");
                    }
                    else if ( j$('#aec_software').prop("checked") === false && j$('#aec_native').prop("checked") === false
                            && j$('#aec_decrease_volume').prop("checked") === false )
                    {
                        j$('#aec_auto').prop("checked", true).checkboxradio("refresh");
                    }
                }

                if (checkbox === 'aec_decrease_volume')
                {
                    if ( j$('#' + checkbox).prop("checked") )
                    {
                        j$('#aec_auto').prop("checked", false).checkboxradio("refresh");
                        j$('#aec_none').prop("checked", false).checkboxradio("refresh");
                    }
                    else if ( j$('#aec_software').prop("checked") === false && j$('#aec_native').prop("checked") === false
                            && j$('#aec_fast').prop("checked") === false )
                    {
                        j$('#aec_auto').prop("checked", true).checkboxradio("refresh");
                    }
                }
                
//--                aec_auto,aec_none,aec_software,aec_native,aec_fast,aec_decrease_volume
            });
            

            j$('#adialog_positive').on('click', function (event)
            {
                if (common.GetBrowser() === 'MSIE') { event.preventDefault(); }

                common.PutToDebugLog(5,"EVENT, settings onListItemClick aec ok");
                
                ManuallyClosePopup(j$.mobile.activePage.find(".messagePopup"));

                mSettValue = '';
                
                if ( j$('#aec_auto').prop("checked") )           { mSettValue += '-1,'; }
                if ( j$('#aec_none').prop("checked") )           { mSettValue += '0,'; }
                if ( j$('#aec_software').prop("checked") )       { mSettValue += '1,'; }
                if ( j$('#aec_native').prop("checked") )         { mSettValue += '2,'; }
                if ( j$('#aec_fast').prop("checked") )           { mSettValue += '3,'; }
                if ( j$('#aec_decrease_volume').prop("checked") ){ mSettValue += '4,'; }

                value[common.SETT_VALUE] = mSettValue;
                value[common.SETT_ISDEFAULT] = '0';
                common.settmap[mCurrSettName] = value;
                common.settmap2[mCurrSettName] = value;
                
                ShowSettValue(mCurrSettName);
            });
        }
        
        if (mCurrSettName === 'serveraddress_user') // has different popup (with help button)
        {
            settDisplayName = common.GetParameter('server_label');
            
            if (common.GetParameterInt('brandid', -1) === 2) //-- gmsdialergold
            {
                settComment = stringres.get('sett_comment_serveraddress_user_gmsdialer');
            }
            
            if ((settDisplayName.toLowerCase()).indexOf('op code') >= 0 || (settDisplayName.toLowerCase()).indexOf('operator code') >= 0)
            {
                settComment = stringres.get('sett_comment_serveraddress_user_operator');
            }
            
            if (common.GetConfig('server_comment').length > 1)
            {
                settComment = common.GetConfig('server_comment');
            }
            
            var srvaddrpart = '';
            var widthclass = '';
            var sdsrv = common.GetParameter('displaytopdomainserveraddress');
            if (common.isNull(sdsrv)) { sdsrv = ''; }
            if (sdsrv.length > 1)
            {
                srvaddrpart = '<span id="setting_item_srvaddrpart">' + sdsrv + '</span>';
                widthclass = 'data-wrapper-class="setting_item_input_class"';
            }
            

            var template = '' +
'<div id="settings_type_server" data-role="popup" class="ui-content messagePopup" data-overlay-theme="a" data-theme="a" style="max-width:' + popupWidth + 'px;">' +

    '<div data-role="header" data-theme="b">' +
        '<a href="javascript:;" data-role="button" data-icon="delete" data-iconpos="notext" class="ui-btn-right closePopup">Close</a>' +
        '<h1 class="adialog_title">' + settDisplayName + '</h1>' +
    '</div>' +
    '<div role="main" class="ui-content adialog_content adialog_btn_nexttoinput">' +
        '<span>' + settComment + '</span>' +
        '<div style="clear: both;"><!--//--></div>' +
        '<input type="text" ' + widthclass + ' id="setting_item_input" name="setting_item" data-theme="a" autocapitalize="off"/>' +
        srvaddrpart +
        '<button id="btn_srvhelp" class="btn_nexttoinput ui-btn ui-btn-corner-all ui-btn-b noshadow"><img src="' + common.GetElementSource() + 'images/icon_help_mark.png"></button>' +
    '</div>' +
    '<div data-role="footer" data-theme="b" class="adialog_footer">' +
        '<a href="javascript:;" id="adialog_positive" class="ui-btn ui-corner-all ui-shadow ui-btn-inline ui-btn-b adialog_2button" data-rel="back" data-transition="flow">' + stringres.get('btn_ok') + '</a>' +
        '<a href="javascript:;" id="adialog_negative" class="ui-btn ui-corner-all ui-shadow ui-btn-inline ui-btn-b adialog_2button" data-rel="back">' + stringres.get('btn_cancel') + '</a>' +
    '</div>' +
'</div>';

            var popupafterclose = function () {};

            j$.mobile.activePage.append(template).trigger("create");
//--            j$.mobile.activePage.append(template).trigger("pagecreate");
            
//-- listen for enter onclick, and click OK button
//--            j$( "#settings_type_server" ).keypress(function( event )
//--            {
//--                if ( event.which === 13)
//--                {
//--                    event.preventDefault();
//--                    j$("#adialog_positive").click();
//--                }else
//--                {
//--                    return;
//--                }
//--            });

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
                    j$('#btn_srvhelp').off('click');
                    popupafterclose();
                }
            });
            
//--     treat serveraddress_user as upperserver. Used in case of standalone tunnel server
            if (common.GetParameter('serverinputisupperserver') === 'true' && (common.GetParameter('autoprovisioning').length < 1 || common.GetParameter('autoprovisioning') === '0'))
            {
                mSettValue = common.GetParameter('upperserver');
            }


            var textBox = document.getElementById('setting_item_input');

            if (!common.isNull(mSettValue) && mSettValue.length > 0 && !common.isNull(textBox))
            {
               var valtmp = mSettValue;
               if (sdsrv.length > 1) { valtmp = mSettValue.replace(sdsrv, ''); }
               textBox.value = valtmp;
            }

            setTimeout(function ()
            {
                if (!common.isNull(textBox)) { textBox.focus(); } // setting cursor to text input
            }, 150);

            j$('#adialog_positive').on('click', function (event)
            {
                if (common.GetBrowser() === 'MSIE') { event.preventDefault(); }

                common.PutToDebugLog(5,"EVENT, settings onListItemClick serveraddress ok");
                
                ManuallyClosePopup(j$.mobile.activePage.find(".messagePopup"));

                var textBoxVal = '';
                if (!common.isNull(textBox)) { textBoxVal = textBox.value; }

                if (!common.isNull(textBoxVal) && textBoxVal.length > 0)
                {
                    mSettValue = common.Trim(textBoxVal);
                    if (common.isNull(mSettValue)) { mSettValue = ''; }

                    mSettValue = common.NormalizeInput(mSettValue, 0);
                    
                    if (sdsrv.length > 1)
                    {
                        mSettValue = mSettValue + sdsrv;
                    }

//--             treat serveraddress_user as upperserver. Used in case of standalone tunnel server
                    if (common.GetParameter('serverinputisupperserver') === 'true')
                    {
//--MODIFYINGUPPERSERVER
                        if (common.GetParameter('autoprovisioning') === '1' || common.GetParameter('autoprovisioning') === '2')
                        {
                            common.SaveParameter('serveraddress_user', mSettValue);
                            common.SaveParameter('upperserver', mSettValue);
                        }else
                        {
                            common.SaveParameter('upperserver', mSettValue);
                        }
                        ShowSettValue(mCurrSettName);
                        return;
                    }else
                    {
                        if (common.GetParameter('autoprovisioning') === '1' || common.GetParameter('autoprovisioning') === '2')
                        {
                            if (global.autoServerDeployVersion && mSettValue.indexOf('.') > 0) //-- IP or domain name is not accepted as serveraddress, only autoprov filename
                            {
                                common.AlertWindow(stringres.get('warning'), stringres.get('warning_msg_2'));
                                return;
                            }

                            mSettValue = mSettValue.toLowerCase();

                            if (mSettValue.indexOf('.') > 0 || mSettValue.toLowerCase() === 'mizu') //-- means it's IP address or domain; not autoprovisioning filename
                            {
                                common.SaveParameter('serveraddress_orig', mSettValue);
                                common.SaveParameter('upperserver', '');
                            }
//--                                mCurrSettName = "autoprov_filename";
                        }else
                        {
                            common.SaveParameter('serveraddress_orig', mSettValue);
                            common.SaveParameter('upperserver', '');
                        }
                    }

                    value[common.SETT_VALUE] = mSettValue;
                    value[common.SETT_ISDEFAULT] = '0';
                    common.settmap[mCurrSettName] = value;
                    common.settmap2[mCurrSettName] = value;
                    
                    ShowSettValue(mCurrSettName);
                }
            });

            j$('#adialog_negative').on('click', function (event)
            {
                if (common.GetBrowser() === 'MSIE') { event.preventDefault(); }
                ManuallyClosePopup(j$.mobile.activePage.find(".messagePopup"));
            });
            
            j$('#btn_srvhelp').on('click', function (event)
            {
                if (common.GetBrowser() === 'MSIE') { event.preventDefault(); }

                j$.mobile.activePage.find(".messagePopup").popup("close");
                
                var btn_findprovider = '<br /><a href="http://www.mizu-voip.com/VoIPServiceProviders.aspx" onclick="common_public.OpenLinkInExternalBrowser(\'http://www.mizu-voip.com/VoIPServiceProviders.aspx\')" id="btn_srvhelp" class="ui-btn ui-corner-all ui-shadow ui-btn-inline ui-btn-b " target="_blank">' + stringres.get('help_provider') + '</a>';
                
//--                var btn_findprovider = '<button id="btn_srvhelp" class="ui-btn ui-btn-corner-all ui-btn-b noshadow">' + stringres.get('help_provider') + '</button>';
//--                http://www.mizu-voip.com/VoIPServiceProviders.aspx
                
                common.AlertDialog(stringres.get('help'), stringres.get('srvaddr_help') + btn_findprovider);
            });
        }
    }
    
    } catch(err) { common.PutToDebugLogException(2, "_settings: OnListItemClick", err); }
}

function ManuallyClosePopup(popupelement) // workaround for IE, sometimes popups are not closed simply by clicking the button, so we close it manually
{
    try{
    if (common.isNull(popupelement) || common.isNull(popupelement.popup)) { return; }
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
    } catch(err) { common.PutToDebugLogException(2, "_settings: ManuallyClosePopup", err); }
}

function ShowSettValue(settname) // display sett value (if not default) in comment
{
    try{
    if (common.isNull(settname) || settname.length < 1)
    {
        common.PutToDebugLog(2, "WARNING, _settings: ShowSettValue settname is NULL");
        return;
    }
    
    var value = common.settmap2[settname];
    if( common.isNull(value) ) { return; }

    var settIsdefault = value[common.SETT_ISDEFAULT];
    

// treat serveraddress_user as upperserver. Used in case of standalone tunnel server
    if (settname === 'serveraddress_user' && common.GetParameter('serverinputisupperserver') === 'true')
    {
        document.getElementById('sett_comment_' + settname).innerHTML = GetSettComment(settname) + ' ' + GetSettFormattedValue(settname);
        return;
    }
    
// no need to add value to comment, because it's the default value
    if (settIsdefault === '1') { return; }
        
    var commentfield = document.getElementById('sett_comment_' + settname);
    if (common.isNull(commentfield))
    {
        common.PutToDebugLog(2, "WARNING, _settings: ShowSettValue commentfield is NULL");
        return;
    }
    
    commentfield.innerHTML = GetSettComment(settname) + ' ' + GetSettFormattedValue(settname);
    
    } catch(err) { common.PutToDebugLogException(2, "_settings: ShowSettValue", err); }
}

function GetSettComment(settname) // returns clean comment
{
    var comment = '';
    try{

    if (common.isNull(settname) || settname.length < 1)
    {
        common.PutToDebugLog(2, "WARNING, _settings: GetSettComment settname is NULL");
        return '';
    }
    
    var value = common.settmap2[settname];

    if( common.isNull(value) ) { return ''; }

    var settComment = stringres.get('sett_comment_'+settname);
    var settCommentShort = stringres.get('sett_comment_short_'+settname);
    
    if (!common.isNull(settCommentShort) && settCommentShort.length > 0)
    {
        comment = settCommentShort;
    }else
    {
        comment = settComment;
    }
    } catch(err) { common.PutToDebugLogException(2, "_settings: GetSettComment", err); }

    return comment;
}

function GetSettFormattedValue(settname) // returns displayable value of settings; ex: if sett value = 'true' -> it retuens 'enabeld'
{
    var fval = '';
    try{
    if (common.isNull(settname) || settname.length < 1)
    {
        common.PutToDebugLog(2, "WARNING, _settings: GetSettComment settname is NULL");
        return '';
    }
    
    var value = common.settmap2[settname];

    if( common.isNull(value) ) { return ''; }
    
    var type = value[common.SETT_TYPE];
//--    var settval = value[common.SETT_VALUE];
    var settval = common.GetParameter(settname);
    
    if (settname === 'password' && settval.length > 0)
    {
        fval = '*****';
    }
    else if (settname === 'loglevel')
    {
        if (settval === '1')
        {
            fval = stringres.get('sett_disabled');
        }else
        {
            fval = stringres.get('sett_enabled');
        }
    }else
    {
        if (type === '0')
        {
            if (settval === 'true' || settval === '2')
            {
               fval = stringres.get('sett_enabled');
            }else
            {
               fval = stringres.get('sett_disabled');
            }
        }
        else if (type === '1')
        {
            fval = settval;
            
            // cut off millisec (last thre zeros)
            if ((settname === 'ringtimeout' || settname === 'calltimeout') /*&& settval.length > 2*/)
            {
                fval = fval.substring(0, fval.length - 3);
            }
        }
        else if (type === '2')
        {
            var allnames = (value[common.SETT_ALLNAMES]).split(',');
            var allvalues = (value[common.SETT_ALLVALUES]).split(',');

            if (common.isNull(allnames) || allnames.length < 1 || common.isNull(allvalues) || allvalues.length < 1)
            {
                return '';
            }

            for (var i = 0; i < allvalues.length; i++)
            {
                if (allvalues[i] === settval)
                {
                    fval = allnames[i];
                    break;
                }
            }
        }
        else if (type === '3')
        {
            var allnames = (value[common.SETT_ALLNAMES]).split(',');
            var allvalues = (value[common.SETT_ALLVALUES]).split(',');
            var valarray = [];

            if (settval.indexOf(',') > 0) { valarray = settval.split(','); } else { valarray[0] = settval; }

            if (common.isNull(allnames) || allnames.length < 1 || common.isNull(allvalues) || allvalues.length < 1 || common.isNull(valarray))
            {
                return '';
            }

            for (var j = 0; j < valarray.length; j ++)
            {
                for (var i = 0; i < allvalues.length; i++)
                {
                    if (allvalues[i] === valarray[j])
                    {
                        if (fval.length > 0) { fval = fval + ', '; }
                        fval = fval + allnames[i];
                    }
                }
            }
        }
        else if (type === '4')
        {
            fval = settval + '%';
        }
        else if (type === '5' || type === '6' || type === '7')
        {
            fval = '';
        }
        else if (type === '8')
        {
            if (settname === 'aec')
            {
                var allnames = (value[common.SETT_ALLNAMES]).split(',');
                var allvalues = (value[common.SETT_ALLVALUES]).split(',');
                var valarray = [];

                if (settval.indexOf(',') > 0) { valarray = settval.split(','); } else { valarray[0] = settval; }

                if (common.isNull(allnames) || allnames.length < 1 || common.isNull(allvalues) || allvalues.length < 1 || common.isNull(valarray))
                {
                    return '';
                }

                for (var j = 0; j < valarray.length; j ++)
                {
                    for (var i = 0; i < allvalues.length; i++)
                    {
                        if (allvalues[i] === valarray[j])
                        {
                            if (fval.length > 0) { fval = fval + ', '; }
                            fval = fval + allnames[i];
                        }
                    }
                }
            }
            else if (settname === 'serveraddress_user')
            {
                if (common.GetParameter('serverinputisupperserver') === 'true' && (common.GetParameter('autoprovisioning').length < 1 || common.GetParameter('autoprovisioning') === '0'))
                {
                    fval = common.GetParameter('upperserver');
                }else
                {
                    fval = settval;
                }
            }
        }
        
        /**type - 0 = checkbox, 1 = text box, 2 = drop down list, 3 = drop down list and checkbox,
		    	 4 = seek bar, 5 = open new activity, 6 = submenu, 7 = drop down list from XML string-array, 8 = custom*/
    }
    
    if (!common.isNull(fval) && fval.length > 0)
    {
        fval = '(' + fval + ')';
    }else
    {
        fval = '';
    }
    } catch(err) { common.PutToDebugLogException(2, "_settings: GetSettFormattedValue", err); }
    
    return fval;
}

function BackOnClick(event)
{
    try{
    if (filtervisible)
    {
        ShowHideSearch();
        return;
    }

    if (currGroup === common.StrToInt(common.GROUP_SIP) || currGroup === common.StrToInt(common.GROUP_MEDIA)
            || currGroup === common.StrToInt(common.GROUP_CALLDIVERT) || currGroup === common.StrToInt(common.GROUP_GENERAL) )
    {
        currGroup = common.StrToInt(common.GROUP_MAIN);
        PopulateList();
//--        j$('#btn_back_settings').hide();
//--        j$('#app_name_settings').show();

        j$('#settings_page_title').html( stringres.get("settings_title") );
        j$('#btn_back_settings').html( '<b>&LT;</b>&nbsp;' + stringres.get("settings_login") );
    }
    else if (currGroup === common.StrToInt(common.GROUP_LOGIN))
    {
        BeforeStart(true);
    }
    else if (currGroup === common.StrToInt(common.GROUP_MAIN))
    {
        currGroup = common.StrToInt(common.GROUP_LOGIN);
        
        if (filtervisible) { ShowHideSearch(); }
        
        if (startedfrom === 'app')
        {
            j$('#btn_back_settings').html( '<b>&LT;</b>&nbsp;' + stringres.get("btn_cancel") );
        }else
        {
            j$('#btn_back_settings').hide();
            j$('#app_name_settings').show();
        }
        
        if (ShowLoginPage())
        {
            j$('#settings_list').hide();
            j$('#loginpage_container').show();
        }
        MeasureSettingslist();

        PopulateList();
        
        j$('#settings_page_title').html( stringres.get("settings_login") );
    }
    else if (currGroup === common.StrToInt(common.GROUP_INTEGRATE))
    {
        currGroup = common.StrToInt(common.GROUP_GENERAL);
        PopulateList();
        
        j$('#settings_page_title').html( stringres.get("sett_display_name_submenu_general") );
        j$('#btn_back_settings').html( '<b>&LT;</b>&nbsp;' + stringres.get("settings_title") );
    }
    else if (currGroup === common.StrToInt(common.GROUP_VIDEO))
    {
        currGroup = common.StrToInt(common.GROUP_MEDIA);
        PopulateList();
        
        j$('#settings_page_title').html( stringres.get("sett_display_name_submenu_media") );
        j$('#btn_back_settings').html( '<b>&LT;</b>&nbsp;' + stringres.get("settings_title") );
    }
    else if (currGroup === common.StrToInt(common.GROUP_SCRSHARE))
    {
        currGroup = common.StrToInt(common.GROUP_MEDIA);
        PopulateList();
        
        j$('#settings_page_title').html( stringres.get("sett_display_name_submenu_media") );
        j$('#btn_back_settings').html( '<b>&LT;</b>&nbsp;' + stringres.get("settings_title") );
    }
    else if (currGroup === 6)
    {
        currGroup = common.StrToInt(common.GROUP_MAIN);
        PopulateList();

        j$('#settings_page_title').html( stringres.get("settings_title") );
    }
    } catch(err) { common.PutToDebugLogException(2, "_settings: BackOnClick", err); }
}

var currfeatureset = 10;
function ShowLoginPage() // whether to show standard login page or settings list
{
    try{
    // -1=auto (default), 0=no, 1=only at first login, 2=always. if -1 then auto 1 if featureset is Minimal, otherwise 0.
    var useloginpage = common.GetConfigInt('useloginpage', 10);
    if (useloginpage > 8) { useloginpage = common.GetParameterInt('useloginpage', -1); }
    
    if (!common.isNull(webphone_api.parameters.useloginpage))
    {
        useloginpage = webphone_api.parameters.useloginpage;
    }
    
    currfeatureset = common.GetConfigInt('featureset', 100);
    if (currfeatureset > 90) { currfeatureset = common.GetParameterInt('featureset', 10); }
    
    if (useloginpage === -1)
    {
        if (currfeatureset < 1) // minimal
        {
            return true;
        }else
        {
            return false;
        }
    }
    else if (useloginpage === 0)
    {
        return false;
    }
    else if (useloginpage === 1)
    {
        if (startedfrom !== 'app')
        {
            return true;
        }else
        {
            return false;
        }
    }else
    {
        return true;
    }
    
    } catch(err) { common.PutToDebugLogException(2, "_settings: ShowLoginPage", err); }
    return false;
}

function SaveSettings (usrstart)
{
    try{
    var settValue = '';
    var settDisplayName = '';
    var settComment = '';
    
//-- autoprovisioning -> if op code changed, then download autoprovisioning (block at start)
    if (currautoprovsrv.toLowerCase() !== (common.GetParameter('serveraddress_user')).toLowerCase()) // means opcode changed
    {
        common.SaveParameter('lastautoprov', '');
    }
    
    if (common.RequestUserServerInput() && common.GetParameter('serverinputisupperserver') === 'true') // must have: sipusername, password, upperserver
    {
//--MODIFYINGUPPERSERVER
        var uppersrv = common.GetParameter('upperserver');
        var usersrv = common.GetParameter('serveraddress_user');
        
        if ((uppersrv.length < 0 || usersrv.indexOf('.') > 0) && common.ShowServerInput())
        {
            common.SaveParameter('iswebrtcuppersrvfromuser', 'true');
            common.SaveParameter('upperserver', usersrv);
        }
            
            
            
        
        if (common.GetParameter('autoprovisioning').length < 1 || common.GetParameter('autoprovisioning') === '0')
        {
            settValue = common.GetParameter('upperserver');
            settDisplayName = stringres.get('sett_display_name_serveraddress_user');
            settComment = stringres.get('sett_comment_serveraddress_user');

            if ( common.isNull(settValue) || settValue.length <= 0 )
            {
//--                common.AlertDialog(settDisplayName, stringres.get('please_enter') + ' ' + settComment);
                common.ShowToast(stringres.get('please_enter') + ' ' + settComment);

                return;
            }
        }else
        {
            settValue = common.GetParameter('serveraddress_user');
            settDisplayName = stringres.get('sett_display_name_serveraddress_user');
            settComment = stringres.get('sett_comment_serveraddress_user');

            if (settValue.toLowerCase() === 'mizu')
            {
                settValue = "voip.mizu-voip.com";

                common.SaveParameter('serveraddress_user', settValue);
            }
        }

        //username
        settValue = common.GetParameter('sipusername');
        settDisplayName = stringres.get('sett_display_name_sipusername');
        settComment = stringres.get('sett_comment_sipusername');

        if ( common.isNull(settValue) || settValue.length <= 0 )
        {
//--            common.AlertDialog(settDisplayName, stringres.get('username_warning'));
            common.ShowToast(stringres.get('username_warning'));
            return;
        }
        if (common.GetConfigBool('mizuserveronly', false) === true && settValue.length < 3)
        {
            common.PutToDebugLog('WARNING, ' + stringres.get('username_warning2') + '_1');
            common.ShowToast(stringres.get('username_warning2'));
            return;
        }


        //password
        settValue = common.GetParameter('password');
        settDisplayName = stringres.get('sett_display_name_password');
        settComment = stringres.get('sett_comment_password');

        if ( common.isNull(settValue) || settValue.length <= 0 )
        {
//--            common.AlertDialog(settDisplayName, stringres.get('please_enter') + ' ' + settComment);
            common.ShowToast(settDisplayName, stringres.get('please_enter') + ' ' + settComment);
            return;
        }
        if (common.GetConfigBool('mizuserveronly', false) === true && settValue.length < 3)
        {
            common.PutToDebugLog(2, 'WARNING, ' + stringres.get('password_warning2') + '_1');
            common.ShowToast(stringres.get('password_warning2'));
            return;
        }
    }else
    {
        if (common.GetParameterBool('customizedversion', true) !== true)
        {
            //username ; request sipusername even for NOT customized version (used for settings filename)
            settValue = common.GetParameter('sipusername');
            settDisplayName = stringres.get('sett_display_name_sipusername');
            settComment = stringres.get('sett_comment_sipusername');

            if ( common.isNull(settValue) || settValue.length <= 0 )
            {
//--                common.AlertDialog(settDisplayName, stringres.get('please_enter') + ' ' + settComment);
                common.ShowToast(stringres.get('username_warning'));
//--                isSaveCommandIssued = false;
                return;
            }
            if (common.GetConfigBool('mizuserveronly', false) === true === true && settValue.length < 3)
            {
                common.PutToDebugLog('WARNING, ' + stringres.get('username_warning2') + '_2');
                common.ShowToast(stringres.get('username_warning2'));
                return;
            }

            settValue = common.GetParameter('serveraddress_user');
            settDisplayName = stringres.get('sett_display_name_serveraddress_user');
            settComment = stringres.get('sett_comment_serveraddress_user');

            if (settValue.toLowerCase() === 'mizu')
            {
                settValue = "voip.mizu-voip.com";

                common.SaveParameter('serveraddress_user', settValue);
            }
        }else
        {

        //username
            settValue = common.GetParameter('sipusername');
            settDisplayName = stringres.get('sett_display_name_sipusername');
            settComment = stringres.get('sett_comment_sipusername');

            if ( common.isNull(settValue) || settValue.length <= 0 )
            {
//--                common.AlertDialog(settDisplayName, stringres.get('please_enter') + ' ' + settComment);
                common.ShowToast(stringres.get('username_warning'));
//--                isSaveCommandIssued = false;
                return;
            }
            if (common.GetConfigBool('mizuserveronly', false) === true && settValue.length < 3)
            {
                common.PutToDebugLog('WARNING, ' + stringres.get('username_warning2') + '_3');
                common.ShowToast(stringres.get('username_warning2'));
                return;
            }

        //password
            settValue = common.GetParameter('password');
            settDisplayName = stringres.get('sett_display_name_password');
            settComment = stringres.get('sett_comment_password');

            if ( common.isNull(settValue) || settValue.length <= 0 )
            {
//--                common.AlertDialog(settDisplayName, stringres.get('please_enter') + ' ' + settComment);
                common.ShowToast(stringres.get('please_enter') + ' ' + settComment);
//--                isSaveCommandIssued = false;
                return;
            }
            if (common.GetConfigBool('mizuserveronly', false) === true && settValue.length < 3)
            {
                common.PutToDebugLog(2, 'WARNING, ' + stringres.get('password_warning2') + '_2');
                common.ShowToast(stringres.get('password_warning2'));
                return;
            }
        }
    }
    
    setTimeout(function ()
    {
//--        don't send extcmd_startwithos by default. only on user click - send oly once and if changed
//--	hide the startwithos option once it is already set
        if (common.IsWindowsSoftphone())
        {
            if (common.ParameterIsDefault('startwithos') === false && common.GetParameterBool('startwithos_was_sent', true) === false)
            {
                var url = common.AddJscommport(global.WIN_SOFTPHONE_URL) + '?extcmd_startwithos=' + common.GetParameter('startwithos');
                common.WinSoftphoneHttpReq(url, 'GET', '', function (resp) { common.PutToDebugLog(2, 'EVENT, _settings: startwithos response: ' + resp); });
                common.SaveParameter('startwithos_was_sent', 'true');
//--                common.WinExternalCommand('startwithos', common.GetParameter('startwithos'));
            }
        }
    }, 5000);
    
    j$('#settings_page_title').html(stringres.get('loading'));
    common.PutToDebugLogSpecial(1, 'EVENT, _settings: SaveSettings set Loading... page title', false, '');

// handle accounts
    if (accountsavailable === false) // true, if there is at least one account created. If "false". means we have to add an account at SaveSettings()
    {
        //acfile = acfile + acTemp[AC_NAME] + ',' + acTemp[AC_SIPUSERNAME] + ',' + acTemp[AC_SETTFILE] + ',' + acTemp[AC_CHFILE] + ',' + acTemp[AC_ISACTIVE] + '\r\n';
        var acctemp = [];
        
        var accname = 'Account' + common.GetParameter('sipusername');
        //accountname+serveraddr+username+salt+password
        var settfilename = common.Md5Hash(accname + common.GetParameter('serveraddress_user') + common.GetParameter('sipusername') + global.SALT + common.GetParameter('password') + common.GetLocationPathName());
        
        var extra = common.GetConfig('brandid');
        if (common.isNull(extra) || extra.length < 1 || extra == '-1')
        {
            extra = common.GetBrandName().toLowerCase();
        }
        settfilename = settfilename + extra;
        
        acctemp[common.AC_NAME] = accname;
        acctemp[common.AC_SIPUSERNAME] = common.GetParameter('sipusername');
        acctemp[common.AC_SETTFILE] = settfilename;
        acctemp[common.AC_CHFILE] = settfilename + '_ch';
        acctemp[common.AC_ISACTIVE] = 'true';
        
        global.aclist.push(acctemp);
    }

    common.SaveSettingsFile(common.GetActiveAccSettingsFilename(), function (retval)
    {
        BeforeStart(usrstart);
        
//--     if demo index page, then also read settings from cookie
        if (window.location.href.indexOf('isdemopage=true') > 0)
        {
            try{
            var stmp = '';
            stmp = common.GetParameter('sipusername'); if (stmp.length > 0) { webphone_api.setparameter('sipusername', stmp); }
            stmp = common.GetParameter('username'); if (stmp.length > 0) { webphone_api.setparameter('username', stmp); }
            stmp = common.GetParameter('password'); if (stmp.length > 0) { webphone_api.setparameter('password', stmp); }
            stmp = common.GetParameter('sippassword'); if (stmp.length > 0) { webphone_api.setparameter('sippassword', stmp); }
            stmp = common.GetParameter('serveraddress_user'); if (stmp.length > 0) { webphone_api.setparameter('serveraddress_user', stmp); }
            stmp = common.GetParameter('serveraddress_orig'); if (stmp.length > 0) { webphone_api.setparameter('serveraddress_orig', stmp); }
            stmp = common.GetParameter('serveraddress'); if (stmp.length > 0) { webphone_api.setparameter('serveraddress', stmp); }
            stmp = common.GetParameter('upperserver'); if (stmp.length > 0) { webphone_api.setparameter('upperserver', stmp); }
            stmp = common.GetParameter('callto'); if (stmp.length > 0) { webphone_api.setparameter('callto', stmp); }
            stmp = common.GetParameter('destination'); if (stmp.length > 0) { webphone_api.setparameter('destination', stmp); }
            
            } catch(e) { common.PutToDebugLogException(2, '_settings: SaveSettings inner1', e); }
        }
        
        setTimeout(function ()
        {
            // save accounts to file
            common.SaveAccountsFile(function (success)
            {
                if (success)
                {
                    common.PutToDebugLog(3, 'EVENT, _settings: SaveSettings Accounts file saved successfully');
                }else
                {
                    common.PutToDebugLog(2, 'ERROR, _settings: SaveSettings Accounts file save failed');
                }
            });
        }, 200);
        
    });
    
    } catch(err) { common.PutToDebugLogException(2, "_settings: SaveSettings", err); }
}

function BeforeStart(usrstart) //-- handle autoprovisioning
{
    try{
    StartPhone(usrstart);
    } catch(err) { common.PutToDebugLogException(2, "_settings: BeforeStart", err); }
}

function StartPhone(usrstart)
{
    try{
//--    j$.mobile.loading('hide');
//--    common.HideModalLoader();
    j$.mobile.changePage("#page_dialpad", { transition: "pop", role: "page" });

    var timeout = 500;
    if (common.IsWindowsSoftphone()) { timeout = 100; }
    setTimeout(function ()
    {
        if (common.IsWindowsSoftphone()) { webphone_public.webphone_started = false; }

        if (usrstart === true)
        {
            common.PutToDebugLog(2, 'EVENT, mlogic API_Start _settings StartPhone');
            webphone_api.start( common.GetParameter('sipusername'), common.GetParameter('password') );
        }
//--        else
//--        {
//--            webphone_api.startInner( common.GetParameter('sipusername'), common.GetParameter('password') );
//--        }
    }, timeout);
    
    setTimeout(function ()
    {
        if (common.UsePresence2() === true)
        {
            common.SetSelectedPresence('Offline', false);
        }
    }, 1000);
    
    if (common.GetConfigInt('brandid', -1) === global.BRAND_KOKOTALK)
    {
        setTimeout(function ()
        {
            common.KokotalkGetToken();
        }, 4000);
    }

    } catch(err) { common.PutToDebugLogException(2, "_settings: StartPhone", err); }
}

//--1: when the engine has to be started (user click on ok or auto login). wait for stage 0 to complete at least 1 seconds even if it was auto started
//--var DELAY = 1000;
//--function StartWithEngineSelect()
//--{
//--    try{
//--    if (global.engineselectstage !== 0 || (common.GetTickCount() - global.engineselecttime) > DELAY)
//--    {
//--        var ret = common.EngineSelect(1);
//--        common.PutToDebugLog(2, 'EVENT, selected engine: '  + common.TestEngineToString(common.GetSelectedEngine(), false));
//--        common.PutToDebugLog(2, 'EVENT, recommended engine: ' + common.TestEngineToString(common.GetRecommendedEngine(), false));
//--        webphone_api.startInner( common.GetParameter('sipusername'), common.GetParameter('password') );
//--        return;
//--    }
//--    //wait for at least 1 second after EngineSelect stage 0 was called
//--    var wait = DELAY - (common.GetTickCount() - global.engineselecttime);
//--    if (wait < 0)
//--    {
//--        wait = 1;
//--    }
//--    setTimeout(function ()
//--    {
//--        var ret = common.EngineSelect(1);
//--        common.PutToDebugLog(2, 'EVENT, selected engine: '  + common.TestEngineToString(common.GetSelectedEngine(), false));
//--        common.PutToDebugLog(2, 'EVENT, recommended engine: ' + common.TestEngineToString(common.GetRecommendedEngine(), false));
//--        webphone_api.startInner( common.GetParameter('sipusername'), common.GetParameter('password') );
//--        return;
//--    }, wait);
//--    } catch(err) { common.PutToDebugLogException(2, "_settings: StartWithEngineSelect", err); }
//--}

function OnNewUserClicked()
{
    try{
    var reguri =  common.GetParameter('newuser');
    
    if ((common.Trim(reguri)).indexOf('*') !== 0) // if starts with * => httpapi ELSE link
    {
        common.OpenWebURL(reguri, stringres.get('newuser'));
    }else
    {
        j$.mobile.changePage("#page_newuser", { transition: "pop", role: "page" });
    }
    } catch(err) { common.PutToDebugLogException(2, "_settings: OnNewUserClicked", err); }
}

function CustomBtn()
{
    try{
    if (common.GetConfigInt('brandid', -1) === 50) // favafone
    {
        j$.mobile.changePage("#page_newuser", { transition: "pop", role: "page" });
    }
    } catch(err) { common.PutToDebugLogException(2, "_settings: CustomBtn", err); }
}

//--var MENUITEM_SETTINGS_EXIT = '#menuitem_settings_exit';
var MENUITEM_LEVEL = '#menuitem_settings_level';
var MENUITEM_SHOW_SETTINGS = '#menuitem_show_settings';
var MENUITEM_SEARCH = '#menuitem_settings_search';
var MENUITEM_HELP = '#menuitem_settings_help';
var MENUITEM_EXIT = '#menuitem_settings_exit';
var MENUITEM_PROVERSION = '#menuitem_settings_proversion';
var MENUITEM_LOGS_CUSTOM = '#menuitem_settings_logs_custom';
var MENUITEM_SPEEDTEST = 'menuitem_settings_speedtest';

function CreateOptionsMenu (menuId) // adding items to menu, called from html
{
    try{
// remove data transition for windows softphone, because it's slow
    if (common.GetParameter('devicetype') === common.DEVICE_WIN_SOFTPHONE())
    {
        j$( "#btn_settings_menu" ).removeAttr('data-transition');
    }

    if ( common.isNull(menuId) || menuId.lenght < 1 ) { common.PutToDebugLog(2, "ERROR, _settings: CreateOptionsMenu menuid null"); return; }

    if (j$(menuId).length <= 0) { common.PutToDebugLog(2, "ERROR, _settings: CreateOptionsMenu can't get reference to Menu"); return; }
    
    if (menuId.charAt(0) !== '#') { menuId = '#' + menuId; }
    
    j$(menuId).html('');
//--    j$(menuId).append( '<li id="' + MENUITEM_SETTINGS_EXIT + '"><a data-rel="back">' + stringres.get('menu_exit') + '</a></li>' ).listview('refresh');

    var menuLevelTitle = '';
    if (isSettLevelBasic)
    {
        menuLevelTitle = stringres.get('menu_switchtoadvanced');
    }else
    {
        menuLevelTitle = stringres.get('menu_switchtobasic');
    }
    
    var searchTitle = '';
    if (filtervisible)
    {
        searchTitle = stringres.get('hide_search');
    }else
    {
        searchTitle = stringres.get('show_search');
    }

    if (currGroup === common.StrToInt(common.GROUP_LOGIN))
    {
        j$(menuId).append( '<li id="' + MENUITEM_SHOW_SETTINGS + '"><a data-rel="back">' + stringres.get('menu_showsettings') + '</a></li>' ).listview('refresh');
    }else
    {
        j$(menuId).append( '<li id="' + MENUITEM_LEVEL + '"><a data-rel="back">' + menuLevelTitle + '</a></li>' ).listview('refresh');
        
        j$(menuId).append( '<li id="' + MENUITEM_SEARCH + '"><a data-rel="back">' + searchTitle + '</a></li>' ).listview('refresh');
    }

    
//--    if (j$('#loginpage_container').is(':visible')) // means we are on login page and settings list is not visible
//--    {
//--        j$(menuId).append( '<li id="' + MENUITEM_SHOW_SETTINGS + '"><a data-rel="back">' + stringres.get('menu_showsettings') + '</a></li>' ).listview('refresh');
//--    }else
//--    {
//--        if (currfeatureset > 5)
//--        {
//--            j$(menuId).append( '<li id="' + MENUITEM_LEVEL + '"><a data-rel="back">' + menuLevelTitle + '</a></li>' ).listview('refresh');
//--        }
//--        j$(menuId).append( '<li id="' + MENUITEM_SEARCH + '"><a data-rel="back">' + searchTitle + '</a></li>' ).listview('refresh');
//--    }
//--j$(menuId).append( '<li id="' + MENUITEM_SHOW_SETTINGS + '"><a data-rel="back">' + stringres.get('menu_showsettings') + '</a></li>' ).listview('refresh');
   
//--    if (common.IsWindowsSoftphone() && common.GetConfig('needactivation') == 'true' && CanShowLicKeyInput())
//--    {
//--        j$(menuId).append( '<li id="' + MENUITEM_PROVERSION + '"><a data-rel="back">' + stringres.get('help_proversion') + '</a></li>' ).listview('refresh');
//--    }
   
    j$(menuId).append( '<li id="' + MENUITEM_SPEEDTEST + '"><a data-rel="back">' + stringres.get('menu_speedtest') + '</a></li>' ).listview('refresh');
    j$("#" + MENUITEM_SPEEDTEST).attr("title", stringres.get('hint_speedtest'));
   
    var help_title = stringres.get('menu_help') + '...';
    if (common.GetConfigInt('brandid', -1) === 60) // voipmuch
    {
        if (startedfrom === 'app')
        {
            j$(menuId).append( '<li id="' + MENUITEM_LOGS_CUSTOM + '"><a data-rel="back">' + stringres.get('logview_title') + '</a></li>' ).listview('refresh'); // add logs to menu if advanced settinsg are displayed
        }
        help_title = stringres.get('help_about');
    }
    j$(menuId).append( '<li id="' + MENUITEM_HELP + '"><a data-rel="back">' + help_title + '</a></li>' ).listview('refresh');
    
    if (common.GetParameter('devicetype') === common.DEVICE_WIN_SOFTPHONE())
    {
        j$(menuId).append( '<li id="' + MENUITEM_EXIT + '"><a data-rel="back">' + stringres.get('menu_exit') + '</a></li>' ).listview('refresh');
    }

    return true;
    
    } catch(err) { common.PutToDebugLogException(2, "_settings: CreateOptionsMenu", err); }
    
    return false;
}

function MenuItemSelected(itemid)
{
    try{
    if (common.isNull(itemid) || itemid.length < 1) { return; }
    
    if (itemid === MENUITEM_SPEEDTEST)
    {
        var uri = 'https://sourceforge.net/speedtest/';
        if (common.IsWindowsSoftphone() === true)
        {
            common_public.OpenLinkInExternalBrowser(uri);
        }else
        {
            window.open(uri);
        }
    }
    
    j$( '#settings_menu' ).on( 'popupafterclose', function( event )
    {
        j$( '#settings_menu' ).off( 'popupafterclose' );
        
        switch (itemid)
        {
//--            case MENUITEM_SETTINGS_EXIT:
//--                alert('Exit');
//--                break;
            case MENUITEM_LEVEL:
                SwitchBetweenBasicAdvanced();
                break;
            case MENUITEM_SHOW_SETTINGS:
                ShowSettings();
                break;
            case MENUITEM_SEARCH:
                ShowHideSearch();
                break;
            case MENUITEM_HELP:
                common.HelpWindow('settings');
                break;
            case MENUITEM_EXIT:
                common.Exit();
                break;
            case MENUITEM_PROVERSION:
                common.UpgradeToProVersion();
                break;
            case MENUITEM_LOGS_CUSTOM:
                j$.mobile.changePage("#page_logview", { transition: "pop", role: "page" });
                break;
        }
    });
    } catch(err) { common.PutToDebugLogException(2, "_settings: MenuItemSelected", err); }
}

function ShowSettings()
{
    try{
    if (j$('#loginpage_container').is(':visible'))
    {
        j$('#loginpage_container').hide();
        j$('#settings_list').show();
    }

    currGroup = common.StrToInt(common.GROUP_MAIN);
    j$('#btn_back_settings').show();
    j$('#app_name_settings').hide();

    j$('#settings_page_title').html( stringres.get("settings_title") );
    j$('#btn_back_settings').html( '<b>&LT;</b>&nbsp;' + stringres.get('settings_login') );
    PopulateList();

    } catch(err) { common.PutToDebugLogException(2, "_settings: ShowSettings", err); }
}

function SwitchBetweenBasicAdvanced()
{
    try{
    if (isSettLevelBasic)
    {
        AdvancedSettProtected();
    }else
    {
        isSettLevelBasic = true;
        if (currGroup === common.StrToInt( common.GROUP_MEDIA )) { currGroup = common.StrToInt( common.GROUP_MAIN ); }
        PopulateList();
        common.SaveParameter('settlevelbasic', 'true');
    }

    } catch(err) { common.PutToDebugLogException(2, "_settings: SwitchBetweenBasicAdvanced", err); }
}

function ShowAdvancedSettings()
{
    try{
    isSettLevelBasic = false;
    // Settings page: if settings is displayed on page under password in menu "Advanced settings" engine select:
    if (currGroup === common.StrToInt(common.GROUP_LOGIN))
    {
        ShowSettings();
        common.SaveParameter('settlevelbasic', 'false');
        return;
    }
    PopulateList();
    common.SaveParameter('settlevelbasic', 'false');

    } catch(err) { common.PutToDebugLogException(2, "_settings: ShowAdvancedSettings", err); }
}

// option to protect advanced settings with password: advancedsettpwd
var settpwdmatche = false;
function AdvancedSettProtected()
{
    try{
    if (settpwdmatche === true)
    {
        ShowAdvancedSettings();
        return;
    }

    var pwd = common.GetConfig('advancedsettpwd');
    if (common.isNull(pwd) || pwd.length < 1) { pwd = common.GetParameter2('advancedsettpwd'); }
    
    if (common.isNull(pwd) || pwd.length < 1)
    {
        settpwdmatche = true;
        ShowAdvancedSettings();
        return;
    }
    pwd = common.Trim(pwd);
    if (pwd.indexOf('encrypted__3__') === 0)
    {
        pwd = common.StrDc(pwd, common.GetPassphrase());
    }
    
// show popup for user to enter unlock password
    var popupWidth = common.GetDeviceWidth();
    if ( !common.isNull(popupWidth) && common.IsNumber(popupWidth) && popupWidth > 100 )
    {
        popupWidth = Math.floor(popupWidth / 1.2);
    }else
    {
        popupWidth = 220;
    }

    var msg = stringres.get('unlockadvancedsett_msg') + ':';
    
    var template = '' +
'<div id="advancedsett_popup" data-role="popup" class="ui-content messagePopup" data-overlay-theme="a" data-theme="a" style="max-width:' + popupWidth + 'px;">' +

    '<div data-role="header" data-theme="b">' +
        '<a href="javascript:;" data-role="button" data-icon="delete" data-iconpos="notext" class="ui-btn-right closePopup">Close</a>' +
        '<h1 class="adialog_title">' + stringres.get('unlockadvancedsett_title') + '</h1>' +
    '</div>' +
    '<div role="main" class="ui-content adialog_content">' +
        '<span>' + msg + '</span>' +
        '<div style="clear: both;"><!--//--></div>' +
        '<input type="text" id="advancedsett_input" name="setting_item" data-theme="a" autocapitalize="off"/>' +
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
//--    j$( "#advancedsett_popup" ).keypress(function( event )
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

    var textBox = document.getElementById('advancedsett_input');
    if (!common.isNull(textBox)) { textBox.focus(); } // setting cursor to text input


    j$('#adialog_positive').on('click', function (event)
    {
        common.PutToDebugLog(5,'EVENT, _settings AdvancedSettProtected ok onclick');

        var textboxval = common.Trim(textBox.value);
        j$( '#advancedsett_popup' ).on( 'popupafterclose', function( event )
        {
            if (!common.isNull(textboxval) && textboxval.length > 0 && textboxval === pwd)
            {
                common.PutToDebugLog(5,'EVENT, _settings AdvancedSettProtected ok onclick password match');
                settpwdmatche = true;
                ShowAdvancedSettings();
            }else
            {
                common.PutToDebugLog(5,'EVENT, _settings AdvancedSettProtected ok onclick password NOT match: ' + textboxval);
                common.ShowToast(stringres.get('err_msg_2'));
            }
        });
    });

    j$('#adialog_negative').on('click', function (event)
    {
        ;
    });

    return;
    } catch(err) { common.PutToDebugLogException(2, "_settings: AdvancedSettProtected", err); }
    ShowAdvancedSettings();
}

var lastback = '';
function ShowHideSearch()
{
    try{

    if (filtervisible)
    {
        if ( common.isNull(lastback) || lastback.length < 2 )
        {
            j$('#btn_back_settings').hide();
            j$('#app_name_settings').show();
        }else
        {
            j$('#btn_back_settings').html(lastback);
            lastback = '';
        }
        
        filtervisible = false;
        j$("#settings_list").prev("form.ui-filterable").hide();
        PopulateList();
        MeasureSettingslist();
    }else
    {
        if (j$('#btn_back_settings').is(':visible'))
        {
            lastback = j$('#btn_back_settings').html();
        }
        j$('#btn_back_settings').show();
        j$('#app_name_settings').hide();
        j$('#btn_back_settings').html( '<b>&LT;</b>&nbsp;' + stringres.get("hide_search") );
        
        filtervisible = true;
        j$("#settings_list").prev("form.ui-filterable").show();
        PopulateList();
        MeasureSettingslist();
    }
    
    } catch(err) { common.PutToDebugLogException(2, "_settings: ShowHideSearch", err); }
}

function onStop(event)
{
    try{
    common.PutToDebugLog(4, "EVENT, _settings: onStop");
    global.isSettingsStarted = false;
    
    startedfrom = '';
    isSettLevelBasic = true;
    eselect_called = false;
    printdevice = false;
    html_engineoption = '';
    
    global.favafone_autologin = false;
    
    if (filtervisible) { ShowHideSearch(); }
    
    } catch(err) { common.PutToDebugLogException(2, "_settings: onStop", err); }
}

function onDestroy (event){} // deprecated by onstop

var settings_public = {

    SaveSettings: SaveSettings
};
window.settings_public = settings_public;

// public members and methods
return {
    onCreate: onCreate,
    onStart: onStart,
    onStop: onStop,
    onDestroy: onDestroy
};
})();