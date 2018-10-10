// Logview
//--define(['jquery', 'common', 'stringres', 'global'], function($, common, stringres, global)
wpa._logview = (function ()
{

function onCreate (event) // called only once - bind events here
{
    try{
    common.PutToDebugLog(4, "EVENT, _logview: onCreate");
    
    j$( window ).resize(function() // window resize handling
    {
        if (j$.mobile.activePage.attr('id') === 'page_logview')
        {
            MeasureLogview();
        }
    });

    j$('#logview_menu_ul').on('click', 'li', function(event)
    {
        MenuItemSelected(j$(this).attr('id'));
    });
    j$("#btn_logview_menu").on("click", function() { CreateOptionsMenu('#logview_menu_ul'); });
    j$("#btn_logview_menu").attr("title", stringres.get("hint_menu"));
    
    j$("#support_selectall").on("click", function()
    {
        j$('#log_text').select();
    });
    
    j$("#sendtosupport").on("click", function()
    {
        var additionalinfo = 'Build date: ' + common.GetParameter('codegenerated');
        common.SendLog(additionalinfo + '&#10;' + global.logs);
    });
    
// it's not working on mobile devices
    if (common.GetOs() === 'Android' || common.GetOs() === 'iOS')
    {
        j$("#support_selectall").hide();
    }
    
    j$("#btn_loghelp").on("click", function()
    {
        common.AlertDialog(stringres.get('help'), stringres.get('logview_help') + ' ' + common.GetParameter('support_email'));
    });
    
    j$("#btn_sendlog").on("click", function()
    {
        common.PutToDebugLog(1, 'EVENT, Log upload succeded');
        setTimeout(function ()
        {
            common.PutToDebugLog(1, 'EVENT, Log upload succeded');
        }, 500);
        
//--        common.ShowToast(stringres.get('logview_msg'), 20000); // this line is blocking submit
//--        setTimeout(function ()
//--        {
//--            j$("#btn_loghelp").show();
//--            common.ShowToast(stringres.get('logview_help'));
//--        }, 2000);
        
//--        j$.mobile.back();

        var pdesc = prompt(stringres.get('log_description'));
        if (common.isNull(pdesc) || pdesc.length < 3)
        {
            common.ShowToast(stringres.get('log_desc_error'));
            return false;
        }else
        {
            var pd = '\n\nProblem description: ' + pdesc + '\n\n';
            j$('#log_text').html(pd + j$('#log_text').html());
            return true;
        }
    });

    if (common.GetOs() !== 'Android' && common.GetOs() !== 'iOS')
    {
        j$('#log_text').attr('readonly', 'readonly');
    }
    } catch(err) { common.PutToDebugLogException(2, "_logview: onCreate", err); }
}

function onStart(event)
{
    try{
    common.PutToDebugLog(4, "EVENT, _logview: onStart");
    global.isLogviewStarted = true;
    
    if (!common.isNull(document.getElementById('logview_title')))
    {
        document.getElementById('logview_title').innerHTML = stringres.get("logview_title");
    }
    j$("#logview_title").attr("title", stringres.get("hint_page"));

    if (!common.isNull(document.getElementById('logview_btnback')))
    {
        document.getElementById('logview_btnback').innerHTML = '<b>&LT;</b>&nbsp;' + stringres.get("go_back_btn_txt");
    }
    
    j$(".separator_line_thick").css( 'background-color', common.HoverCalc(common.getBgColor('#logview_header'), -30) );
    
    j$("#label_disable_logs").html(stringres.get('disable_logs'));
    
//--    var email = common.GetConfig('log_email');
//--    if (!common.isNull(email) && email.length > 2)
//--    {
//--        if (!common.isNull(document.getElementById("sendtosupport_link")))
//--        {
//--            document.getElementById("sendtosupport_link").innerHTML = stringres.get("sendtosupport");
//--        }
//--        if (!common.isNull(document.getElementById("support_selectall")))
//--        {
//--            document.getElementById("support_selectall").innerHTML = stringres.get("support_selectall");
//--        }
//--        mailto:test@example.com?subject=subject&body=body
        
//--        var href = 'mailto:' + common.Trim(email) + '?subject=JSPhone Log&body=' + stringres.get('support_email_body');
//--        href = common.ReplaceAll(href, ' ', '%20');
        
//--        var href = 'mailto:' + common.Trim(email) + '?subject=' + encodeURIComponent('WebPhone Log') + '&body=' + stringres.get('support_email_body');
//--        j$('#sendtosupport_link').attr('href', href);
        
//--        Spaces between words should be replaced by %20 to ensure that the browser will display the text properly.
//--    }else
//--    {
//--        j$("#sendtosupport_container").hide();
//--    }
    
    //handle logsendto option: 0=no options, 1=mizutech upload, 2=email (support email from config)
    var logsendto = common.GetConfigInt('logsendto', 1);
    
    if (logsendto < 1)
    {
        j$("#sendtosupport_container").hide();
    }
    else if (logsendto === 1) // send to mizu with xlogpush
    {
        j$('#sendtosupport_link').hide();
        j$("#sendtosupport_container").show();
    }
    else if (logsendto === 2) // send in email
    {
        j$('#btn_sendlog').hide();

        var email = common.GetConfig('supportmail');
        if (common.isNull(email) || email.length < 2) { email = common.GetConfig('log_email'); }
        
        if (!common.isNull(common.GetConfig('log_email')) && email.length > 2)
        {
            
            j$('#sendtosupport_link').html(stringres.get("sendtosupport"));
            j$('#sendtosupport_link').show();
            
            //mailto:test@example.com?subject=subject&body=body
            //var href = 'mailto:' + common.Trim(email) + '?subject=JSPhone Log&body=' + stringres.get('support_email_body');
            //href = common.ReplaceAll(href, ' ', '%20');

            var href = 'mailto:' + common.Trim(email) + '?subject=' + encodeURIComponent('WebPhone Log') + '&body=' + stringres.get('support_email_body');
            j$('#sendtosupport_link').attr('href', href);

            //Spaces between words should be replaced by %20 to ensure that the browser will display the text properly.
        }
    }
    
    MeasureLogview();
    
    var additionalinfo = 'Build date: ' + common.GetParameter('codegenerated');
    
    j$('#log_text').html(additionalinfo + '&#10;' + global.logs);
//--    j$('#log_text').textinput('refresh');
//--    document.getElementById('log_text').value = global.logs;
    
    // add filename parameter to form
    if (!common.isNull(document.getElementById('filename')))
    {
        var srv = common.GetParameter('serveraddress_user');
        if (srv.length < 2) { srv = common.GetParameter('serveraddress'); }
        try{ if (srv.length < 2 && !isNull(webphone_api.parameters) && !isNull(webphone_api.parameters.serveraddress)) { srv = webphone_api.parameters.serveraddress; } } catch(errin) {  }
        if (srv.length < 2) { srv = common.GetConfig('serveraddress'); }
        if (common.isNull(srv)) { srv = ''; }
        srv = srv.replace('://', '');
        
        var logfilename = common.GetParameter('logform_filename');
        
        if (common.isNull(logfilename) || logfilename.length < 1)
        {
            logfilename = common.GetParameter('sipusername');
            if (!common.isNull(common.GetParameter('brandname'))) { logfilename = logfilename + '_' + encodeURIComponent(common.GetParameter('brandname')); }
            if (!common.isNull(srv)) { logfilename = logfilename + '_' + encodeURIComponent(srv); }
        }

        common.PutToDebugLog(2, 'EVENT, _logview filename: ' + logfilename);
        
        document.getElementById('filename').value = logfilename;
    }
    
    if (!common.isNull(document.getElementById('wplocation')))
    {
        try{
        var loc = window.location.href;
        if (!common.isNull(loc) && loc.length > 0)
        {
            loc = loc.toLowerCase();
            var pos = loc.indexOf('#');
            if (pos > 0)
            {
                loc = loc.substring(0, pos);
            }
            if (common.isNull(loc)) { loc = ''; }
            loc = common.Trim(loc);
            document.getElementById('wplocation').value = loc;
        }
        } catch(err) { common.PutToDebugLogException(2, "_logview: onStart Inner", err); }
    }
    
    } catch(err) { common.PutToDebugLogException(2, "_logview: onStart", err); }
}

function MeasureLogview() // resolve window height size change
{
    try{
//--    var pgh = common.GetDeviceHeight() - 1; j$('#page_logview').css('min-height', pgh + 'px'); // must be set when softphone is skin in div
    j$('#page_logview').css('min-height', 'auto'); // must be set when softphone is skin in div
    
    j$("#page_logview_content").height(common.GetDeviceHeight() - j$("#logview_header").height() - 2);
    var ltheight = common.GetDeviceHeight() - j$("#logview_header").height() - 5;
    
    if (j$('#sendtosupport_container').is(':visible'))
    {
        ltheight = ltheight - j$("#sendtosupport_container").height();
    }
    
    j$("#log_text").height(ltheight);
    j$("#log_text").width(common.GetDeviceWidth());

    } catch(err) { common.PutToDebugLogException(2, "_logview: MeasureLogview", err); }
}

var MENUITEM_CLOSE = '#menuitem_logview_close';

function CreateOptionsMenu (menuId) // adding items to menu, called from html
{
    try{
// remove data transition for windows softphone, because it's slow
    if (common.GetParameter('devicetype') === common.DEVICE_WIN_SOFTPHONE())
    {
        j$( "#btn_logview_menu" ).removeAttr('data-transition');
    }

    if ( common.isNull(menuId) || menuId.lenght < 1 ) { common.PutToDebugLog(2, "ERROR, _logview: CreateOptionsMenu menuid null"); return; }

    if (j$(menuId).length <= 0) { common.PutToDebugLog(2, "ERROR, _logview: CreateOptionsMenu can't get reference to Menu"); return; }
    
    if (menuId.charAt(0) !== '#') { menuId = '#' + menuId; }
    
    j$(menuId).html('');
    j$(menuId).append( '<li id="' + MENUITEM_CLOSE + '"><a data-rel="back">' + stringres.get('menu_close') + '</a></li>' ).listview('refresh');

    return true;
    
    } catch(err) { common.PutToDebugLogException(2, "_logview: CreateOptionsMenu", err); }
    
    return false;
}

function MenuItemSelected(itemid)
{
    try{
    if (common.isNull(itemid) || itemid.length < 1) { return; }
    
    j$( '#logview_menu' ).on( 'popupafterclose', function( event )
    {
        j$( '#logview_menu' ).off( 'popupafterclose' );
        
        switch (itemid)
        {
            case MENUITEM_CLOSE:
                j$.mobile.back();
                break;
        }
    });
    } catch(err) { common.PutToDebugLogException(2, "_logview: MenuItemSelected", err); }
}

function onStop(event)
{
    try{
    common.PutToDebugLog(4, "EVENT, _logview: onStop");
    global.isLogviewStarted = false;
    
    if (j$('#disable_logs').prop("checked"))
    {
        common.SaveParameter('loglevel', '1');
        common.SaveParameter('jsscriptevent', '2');
        webphone_api.setparameter('jsscriptevent', '2');
        global.loglevel = 1;
        
        j$('#disable_logs').prop("checked", false).checkboxradio('refresh');
    }
    
    j$('#log_text').html('');
//--    document.getElementById('log_text').value = '';
    
    } catch(err) { common.PutToDebugLogException(2, "_logview: onStop", err); }
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