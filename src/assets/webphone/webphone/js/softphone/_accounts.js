// Accounts page
//--define(['jquery', 'common', 'stringres', 'global'], function($, common, stringres, global)
wpa._accounts = (function ()
{

function onCreate (event) // called only once - bind events here
{
    try{
    common.PutToDebugLog(4, "EVENT, _accounts: onCreate");
    
    j$( window ).resize(function() // window resize handling
    {
        if (j$.mobile.activePage.attr('id') === 'page_accounts')
        {
            MeasureAccountst();
        }
    });
    
    j$('#accounts_menu_ul').on('click', 'li', function(event)
    {
        MenuItemSelected(j$(this).attr('id'));
    });
    j$("#btn_accounts_menu").on("click", function() { CreateOptionsMenu('#accounts_menu_ul'); });
    j$("#btn_accounts_menu").attr("title", stringres.get("hint_menu"));
    
    j$(".minus_btn").attr("title", stringres.get("hint_removephone"));
    
    j$("#btn_add_acc").attr("title", stringres.get("accounts_add_hint"));
    
    } catch(err) { common.PutToDebugLogException(2, "_accounts: onCreate", err); }
}

function onStart(event)
{
    try{
    common.PutToDebugLog(4, "EVENT, _accounts: onStart");
    global.isAccountsStarted = true;

    j$("#btn_add_acc").on("click", function() { AddAccount(); });
        
    j$('#acc_add_p').html(stringres.get('add_account'))
    document.getElementById('aec_label_phone').innerHTML = stringres.get('contact_phone');
    
    j$("#accounts_list").attr("data-filter-placeholder", stringres.get("ct_search_hint"));
    
    j$(".separator_line_thick").css( 'background-color', common.HoverCalc(common.getBgColor('#page_accounts'), -30) );
    
    if (!common.isNull(document.getElementById('addeditct_btnback')))
    {
        document.getElementById('addeditct_btnback').innerHTML = '<b>&LT;</b>&nbsp;' + stringres.get('btn_cancel');
    }
    
// needed for proper display and scrolling of listview
    MeasureAccountst();
    
    document.getElementById('accounts_title').innerHTML = stringres.get('accounts_title');
    j$("#accounts_title").attr("title", stringres.get("hint_page"));
    
    PopulateData();
    
    } catch(err) { common.PutToDebugLogException(2, "_accounts: onStart", err); }
}

function MeasureAccountst() // resolve window height size change
{
    try{
    j$('#page_accounts').css('min-height', 'auto'); // must be set when softphone is skin in div

    var heightTemp = common.GetDeviceHeight() - j$("#accounts_header").height(); // - j$('#acc_footer').height();
    heightTemp = heightTemp - 5;
    j$("#page_accounts_content").height(heightTemp);
    
    } catch(err) { common.PutToDebugLogException(2, "_accounts: MeasureAccountst", err); }
}

var atemplate = '' +
    '<div class="acc_item" id="acc_item_[NR]">' +
        '<div class="acc_control">' +
            '<input type="checkbox" class="acc_checkbox" id="acc_checkbox_[NR]" title="' + stringres.get('accounts_endis_hint') + '" name="acc_checkbox_[NR]" [ENABLE_CHECKED]>' +
            '<input type="radio" class="acc_radio" id="acc_radio_[NR]" title="' + stringres.get('accounts_main_hint') + '" name="acc_active_selection" [MAIN_CHECKED]>' +
        '</div>' +
        '<div class="acc_username" id="acc_username_[NR]">[USERNAME]</div>' +
        '<div class="acc_remove"><button id="btn_remove_account_[NR]" title="' + stringres.get('accounts_remove_hint') + '" class="btn_remove_account noshadow ui-btn-inline ui-btn ui-btn-corner-all ui-btn-b ui-icon-minus ui-btn-icon-notext">Remove</button></div>' +
        '<div class="separator_color_bg"><!--//--></div>' +
    '</div>';

function PopulateData()
{
    try{
// check/uncheck radio buttons

    var form = '';
    
//    extraregisteraccounts = server,usr,pwd,ival;server2,usr2,pwd2, ival;
    if (common.isNull(global.sipaccounts) || global.sipaccounts.length < 1)
    {
        j$('.btn_remove_account').off('click');
        j$('#acc_list').html('<br /><br />' + stringres.get('noaccounts'));
        return;
    }
    
    for (var i = 0; i < global.sipaccounts.length; i++)
    {
        var sipitem = global.sipaccounts[i];
        var htmlitem = common.ReplaceAll(atemplate, '[NR]', i.toString());
        
        htmlitem = htmlitem.replace('[USERNAME]', sipitem.username);
        if (sipitem.ismain === true)
        {
            htmlitem = htmlitem.replace('[MAIN_CHECKED]', 'checked="checked"');
        }else
        {
            htmlitem = htmlitem.replace('[MAIN_CHECKED]', '');
        }
        
        if (sipitem.enabled === true)
        {
            htmlitem = htmlitem.replace('[ENABLE_CHECKED]', 'checked="checked"');
        }else
        {
            htmlitem = htmlitem.replace('[ENABLE_CHECKED]', '');
        }
        
        form = form + htmlitem;
    }

    j$('#acc_list').html(form);
    j$('#acc_list').trigger('create');
    
    j$('.btn_remove_account').on('click', function (e)
    {
        try{
        var id = j$(this).attr('id');
        if (!common.isNull(id) && id.lastIndexOf('_') > 0)
        {
            var idxstr = id.substring(id.lastIndexOf('_') + 1);
            
            if (!common.isNull(idxstr) && common.IsNumber(idxstr) === true)
            {
                var idx = common.StrToInt(idxstr);
                global.sipaccounts.splice(idx, 1);
                
                common.PutToDebugLog(2, 'EVENT, _accounts, account removed: ' + idxstr);
                
                var anychecked = false;
                for (var i = 0; i < global.sipaccounts.length; i++)
                {
                    if (i !== idx && global.sipaccounts[i].enabled === true)
                    {
                        anychecked = true;
                    }
                }
                if (!anychecked)
                {
                    if (global.sipaccounts.length > 1)
                    {
                        for (var i = 0; i < global.sipaccounts.length; i++)
                        {
                            if (i !== idx)
                            {
                                global.sipaccounts[i].enabled = true;
                                document.getElementById('acc_checkbox_' + i).checked = true;
                            // reset ismain
                                for (var j = 0; j < global.sipaccounts.length; j++) { global.sipaccounts[j].ismain = false; }
                                global.sipaccounts[i].ismain = true;
                                j$('#acc_radio_' + i).prop('checked', true);
                                break;
                            }
                        }
                    }else
                    {
                        if (!common.isNull(global.sipaccounts) && global.sipaccounts.length > 0)
                        {
                            global.sipaccounts[0].enabled = true;
                            document.getElementById(id).checked = true;
                        // reset ismain
                            for (var j = 0; j < global.sipaccounts.length; j++) { global.sipaccounts[j].ismain = false; }
                            global.sipaccounts[0].ismain = true;
                            j$('#acc_radio_0').prop('checked', true);
                        }
                    }
                }
                
                common.SaveSipAccounts();
                PopulateData();
                
                if (global.sipaccounts.length < 1)
                {
                    AddAccount();
                }
            }
        }
        } catch(err) { common.PutToDebugLogException(2, "_accounts: remove account", err); }
    });
    
    j$('.acc_checkbox').on('change', function (e)
    {
        try{
        var id = j$(this).attr('id');
        if (!common.isNull(id) && id.lastIndexOf('_') > 0)
        {
            var checked = document.getElementById(id).checked;
            var idxstr = id.substring(id.lastIndexOf('_') + 1);
            
            if (!common.isNull(idxstr) && common.IsNumber(idxstr) === true)
            {
                var idx = common.StrToInt(idxstr);
                global.sipaccounts[idx].enabled = checked;
                
                var anychecked = false;
                for (var i = 0; i < global.sipaccounts.length; i++)
                {
                    if (i !== idx && global.sipaccounts[i].enabled === true)
                    {
                        anychecked = true;
                        break;
                    }
                }
                
                if (!anychecked)
                {
                    if (global.sipaccounts.length > 1)
                    {
                        for (var i = 0; i < global.sipaccounts.length; i++)
                        {
                            if (i !== idx)
                            {
                                global.sipaccounts[i].enabled = true;
                                document.getElementById('acc_checkbox_' + i).checked = true;
                            // reset ismain
                                for (var j = 0; j < global.sipaccounts.length; j++) { global.sipaccounts[j].ismain = false; }
                                global.sipaccounts[i].ismain = true;
                                j$('#acc_radio_' + i).prop('checked', true);
                                break;
                            }
                        }
                    }else
                    {
                        global.sipaccounts[0].enabled = true;
                        document.getElementById(id).checked = true;
                    // reset ismain
                        for (var j = 0; j < global.sipaccounts.length; j++) { global.sipaccounts[j].ismain = false; }
                        global.sipaccounts[0].ismain = true;
                        j$('#acc_radio_0').prop('checked', true);
                    }
                }else
                {
                    if (checked === false && global.sipaccounts[idx].ismain === true)
                    {
                        // if we uncheck/disable the main account, then select another main account
                        for (var i = 0; i < global.sipaccounts.length; i++)
                        {
                            if (i === idx || global.sipaccounts[i].enabled === false) { continue; }
                            
                        // reset ismain
                            for (var j = 0; j < global.sipaccounts.length; j++) { global.sipaccounts[j].ismain = false; }
                            
                            global.sipaccounts[i].ismain = true;
                            break;
                        }
                    }
                }
                
                
                for (var i = 0; i < global.sipaccounts.length; i++)
                {
                    if(j$('#acc_radio_' + i).is(':checked'))
                    {
                        global.sipaccounts.ismain = true;
                    }else
                    {
                        global.sipaccounts.ismain = false;
                    }
                }
                
                j$('.acc_checkbox').off('change');
                common.SaveSipAccounts();
                setTimeout(function ()
                {
                    PopulateData();
                }, 0);
            }
        }
        } catch(err) { common.PutToDebugLogException(2, "_accounts: change ismain", err); }
    });
    
    j$(".acc_radio").change(function ()
    {
        try{
        for (var i = 0; i < global.sipaccounts.length; i++)
        {
            if(j$('#acc_radio_' + i).is(':checked'))
            {
            // reset ismain
                for (var j = 0; j < global.sipaccounts.length; j++) { global.sipaccounts[j].ismain = false; }
                
                global.sipaccounts[i].ismain = true;
                if (global.sipaccounts[i].enabled === false)
                {
                    global.sipaccounts[i].enabled = true;
                }
                
                j$('.acc_radio').off('change');
                common.SaveSipAccounts();
                setTimeout(function ()
                {
                    PopulateData();
                }, 0);
                
                break;
            }
        }
        } catch(err) { common.PutToDebugLogException(2, "_accounts: select ismain", err); }
    });
    
    } catch(err) { common.PutToDebugLogException(2, "_accounts: PopulateData", err); }
}

function AddAccount(popupafterclose)
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
'<div id="addaccountpopup" data-role="popup" class="ui-content messagePopup" data-overlay-theme="a" data-theme="a" style="max-width:' + popupWidth + 'px;">' +

    '<div data-role="header" data-theme="b">' +
        '<a href="javascript:;" data-role="button" data-icon="delete" data-iconpos="notext" class="ui-btn-right closePopup">Close</a>' +
        '<h1 class="adialog_title">' + stringres.get('addaccount_title') + '</h1>' +
    '</div>' +
    '<div role="main" class="ui-content adialog_content">' +
    
        '<style>#addaccountpopup LABEL{ text-align: left; font-size: .8em; }</style>' +
        '<span>' + stringres.get('addaccount_msg') + '</span>' +
        
        '<br /><label for="addacc_serveraddress">' + stringres.get('addacc_server') + ':</label>'+
        '<input type="text" id="addacc_serveraddress" name="addacc_serveraddress" data-theme="a" autocapitalize="off"/>' +
        
        '<br /><label for="addacc_username">' + stringres.get('addacc_user') + ':</label>'+
        '<input type="text" id="addacc_username" name="addacc_username" data-theme="a" autocapitalize="off"/>' +
        
        '<br /><label for="addacc_password">' + stringres.get('addacc_password') + ':</label>'+
        '<input type="text" id="addacc_password" name="addacc_password" data-theme="a" autocapitalize="off"/>' +
        
        '<br /><label for="addacc_ival">' + stringres.get('addacc_ival') + ':</label>'+
        '<input type="text" id="addacc_ival" name="addacc_ival" value="3600" data-theme="a" autocapitalize="off"/>' +
    '</div>' +
    '<div data-role="footer" data-theme="b" class="adialog_footer">' +
        '<a href="javascript:;" id="adialog_positive" class="ui-btn ui-corner-all ui-shadow ui-btn-inline ui-btn-b adialog_2button" data-rel="back" data-transition="flow">' + stringres.get('btn_ok') + '</a>' +
        '<a href="javascript:;" id="adialog_negative" class="ui-btn ui-corner-all ui-shadow ui-btn-inline ui-btn-b adialog_2button" data-rel="back">' + stringres.get('btn_cancel') + '</a>' +
    '</div>' +
'</div>';

        var popupafterclose = function () {};

        j$.mobile.activePage.append(template).trigger("create");

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
            var srv = j$('#addacc_serveraddress').val();
            var usr = j$('#addacc_username').val();
            var pwd = j$('#addacc_password').val();
            var ivalstr = j$('#addacc_ival').val();

            j$( '#addaccountpopup' ).on( 'popupafterclose', function( event )
            {
                if (common.GetBrowser() === 'MSIE') { event.preventDefault(); }

                common.PutToDebugLog(5,"EVENT, accounts AddAccount ok onclick");
                ManuallyClosePopup(j$.mobile.activePage.find(".messagePopup"));

                if (common.isNull(srv) || srv.length < 1) { common.ShowToast(stringres.get('addacc_invalid') + ' ' + stringres.get('addacc_server')); return; }
                if (common.isNull(usr) || usr.length < 1) { common.ShowToast(stringres.get('addacc_invalid') + ' ' + stringres.get('addacc_user')); return; }
                if (common.isNull(pwd) || pwd.length < 1) { common.ShowToast(stringres.get('addacc_invalid') + ' ' + stringres.get('addacc_password')); return; }
                if (common.isNull(ivalstr) || ivalstr.length < 1 || !common.IsNumber(ivalstr)) { common.ShowToast(stringres.get('addacc_invalid') + ' ' + stringres.get('addacc_ival')); return; }
                
                srv = common.NormalizeInput(srv, 0);
                usr = common.NormalizeInput(usr, 0);
                ivalstr = common.NormalizeInput(ivalstr, 0);
                
                if (common.isNull(ivalstr) || common.IsNumber(ivalstr) == false) { ivalstr = '3600'; }
                var ival = common.StrToInt(ivalstr);
                
                var ismain = false;
                if (global.sipaccounts.length < 1) { ismain = true; }
                
                common.AddOneAcc(srv, usr, pwd, ival, true, ismain);
              
                PopulateData();
            });
        });

        j$('#adialog_negative').on('click', function (event)
        {
            if (common.GetBrowser() === 'MSIE') { event.preventDefault(); }
            ManuallyClosePopup(j$.mobile.activePage.find(".messagePopup"));
        });
    
    } catch(err) { common.PutToDebugLogException(2, "_accounts: AddAccount", err); }
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
    } catch(err) { common.PutToDebugLogException(2, "_accounts: ManuallyClosePopup", err); }
}

var MENUITEM_ACCOUNTS_SAVE = '#menuitem_accounts_save';
var MENUITEM_ACCOUNTS_REVERT = '#menuitem_accounts_revert';

function CreateOptionsMenu (menuId) // adding items to menu, called from html
{
    try{
// remove data transition for windows softphone, because it's slow
    if (common.IsWindowsSoftphone())
    {
        j$( "#btn_accounts_menu" ).removeAttr('data-transition');
    }

    if ( common.isNull(menuId) || menuId.lenght < 1 ) { common.PutToDebugLog(2, "ERROR, _accounts: CreateOptionsMenu menuid null"); return; }

    if (j$(menuId).length <= 0) { common.PutToDebugLog(2, "ERROR, _accounts: CreateOptionsMenu can't get reference to Menu"); return; }
    
    if (menuId.charAt(0) !== '#') { menuId = '#' + menuId; }
    
    j$(menuId).html('');
    j$(menuId).append( '<li id="' + MENUITEM_ACCOUNTS_SAVE + '"><a data-rel="back">' + stringres.get('btn_save') + '</a></li>' ).listview('refresh');
    
    j$(menuId).append( '<li id="' + MENUITEM_ACCOUNTS_REVERT + '"><a data-rel="back">' + stringres.get('btn_revert') + '</a></li>' ).listview('refresh');

    return true;
    
    } catch(err) { common.PutToDebugLogException(2, "_accounts: CreateOptionsMenu", err); }
    
    return false;
}

function MenuItemSelected(itemid)
{
    try{
    if (common.isNull(itemid) || itemid.length < 1) { return; }
    
    j$( '#accounts_menu' ).on( 'popupafterclose', function( event )
    {
        j$( '#accounts_menu' ).off( 'popupafterclose' );
        
        switch (itemid)
        {
            case MENUITEM_ACCOUNTS_SAVE:
                SaveContact();
                break;
            case MENUITEM_ACCOUNTS_REVERT:
                j$.mobile.back();
                break;
        }
    });
    } catch(err) { common.PutToDebugLogException(2, "_accounts: MenuItemSelected", err); }
}

function onStop(event)
{
    try{
    common.PutToDebugLog(4, "EVENT, _accounts: onStop");
    global.isAccountsStarted = false;
    j$('.btn_remove_account').off('click');
    j$('#btn_add_acc').off('click');
    j$('#acc_list').html('');
    } catch(err) { common.PutToDebugLogException(2, "_accounts: onStop", err); }
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