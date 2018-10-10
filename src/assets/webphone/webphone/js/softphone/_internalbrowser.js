// Internal Browser page
//--define(['jquery', 'common', 'stringres', 'global'], function($, common, stringres, global)
wpa._internalbrowser = (function ()
{
var url = '';
var lastpage = '';
var pagetitle = '';

function onCreate (event) // called only once - bind events here
{
    try{
    common.PutToDebugLog(4, "EVENT, _internalbrowser: onCreate");
    
    j$( window ).resize(function() // window resize handling
    {
        if (j$.mobile.activePage.attr('id') === 'page_internalbrowser')
        {
            MeasureInternalbrowser();
        }
    });

    j$('#internalbrowser_menu_ul').on('click', 'li', function(event)
    {
        MenuItemSelected(j$(this).attr('id'));
    });
    j$("#btn_internalbrowser_menu").on("click", function() { CreateOptionsMenu('#internalbrowser_menu_ul'); });
    j$("#btn_internalbrowser_menu").attr("title", stringres.get("hint_menu"));
    
    j$("#internalbrowser_btnback").on("click", function(e)
    {
        CloseBrowser();
        e.preventDefault();
    });
    
    } catch(err) { common.PutToDebugLogException(2, "_internalbrowser: onCreate", err); }
}

function onStart(event)
{
    try{
    common.PutToDebugLog(4, "EVENT, _internalbrowser: onStart");
    global.isInternalbrowserStarted = true;
    
    j$('#page_internalbrowser_content').html('');

    url = common.GetIntentParam(global.intentbrowser, 'url');
    lastpage = common.GetIntentParam(global.intentbrowser, 'lastpage');
    pagetitle = common.GetIntentParam(global.intentbrowser, 'title');

    if (!common.isNull(document.getElementById('internalbrowser_title')))
    {
        if (common.isNull(pagetitle)) { pagetitle = ''; }
        document.getElementById('internalbrowser_title').innerHTML = pagetitle;
    }
    j$("#internalbrowser_title").attr("title", stringres.get("hint_page"));

    if (!common.isNull(document.getElementById('internalbrowser_btnback')))
    {
        document.getElementById('internalbrowser_btnback').innerHTML = '<b>&LT;</b>&nbsp;' + stringres.get("go_back_btn_txt");
    }
    
    MeasureInternalbrowser();
    
    if (common.isNull(lastpage))
    {
        lastpage = '';
    }else
    {
        lastpage = common.Trim(lastpage);
    }
    
    OpenWebpage();
    
    } catch(err) { common.PutToDebugLogException(2, "_internalbrowser: onStart", err); }
}

function MeasureInternalbrowser() // resolve window height size change
{
    try{
    //--var pgh = common.GetDeviceHeight() - 1; j$('#page_internalbrowser').css('min-height', pgh + 'px'); // must be set when softphone is skin in div
    j$('#page_internalbrowser').css('min-height', 'auto'); // must be set when softphone is skin in div

    j$(".separator_line_thick").css( 'background-color', common.HoverCalc(common.getBgColor('#page_internalbrowser'), -30) );
    
    var heightTemp = common.GetDeviceHeight() - j$("#internalbrowser_header").height();
    heightTemp = heightTemp - 3;
    heightTemp = Math.floor(heightTemp);
    j$("#page_internalbrowser_content").height(heightTemp);
    
    j$("#iframe_internalbrowser").width(common.GetDeviceWidth());
    j$("#iframe_internalbrowser").height(heightTemp - 5);
    
    } catch(err) { common.PutToDebugLogException(2, "_internalbrowser: MeasureInternalbrowser", err); }
}

function OpenWebpage()
{
    try{
        
//--    url = 'http://www.mizu-voip.com';
    if (common.isNull(url) || url.length < 3 )
    {
        common.PutToDebugLog(3, 'ERROR, _internalbrowser no url to load: ' + url);
        return;
    }
    
    var width = common.GetDeviceWidth();
    var height = Math.floor( j$('#page_internalbrowser_content').height() - 5);
    
    var iframe = '';
    var pos = url.indexOf('[POST]');
    if (pos > 0)
    {
        var purl = common.Trim(url.substring(0, pos));
        var pdataStr = common.Trim(url.substring(pos + 6));
        var pdata = [];
        var pdataInput = '';
        
        if (!common.isNull(pdataStr) && pdataStr.length > 0)
        {
            pdata = pdataStr.split('&');
            if (common.isNull(pdata)) { pdata = []; }
        }
        
        for (var i = 0; i < pdata.length; i++)
        {
            if (common.isNull(pdata[i]) || pdata[i].length < 2 || pdata[i].indexOf('=') < 1) { continue; }
            
            var name = pdata[i].substring(0, pdata[i].indexOf('='));
            var val = pdata[i].substring(pdata[i].indexOf('=') + 1);
            
            if (common.isNull(name) || name.length < 1 || common.isNull(val)) { continue; }
            
            pdataInput += '<input type="hidden" name="' + name + '" value="' + val + '"/>';
        }

        iframe = '<form id="internalb_post" target="iframe_internalbrowser" method="post" action="' + purl + '">' +
                    pdataInput +
                    '</form>' + 
                    '<iframe allow="microphone; camera" frameborder="0" width="' + width + '" height="' + height + '" name="iframe_internalbrowser" id="iframe_internalbrowser" style="margin:0px; padding:0px;" sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-top-navigation"></iframe>' +
                    '<script type="text/javascript">' +
                        'document.getElementById("internalb_post").submit();' +
                    '</script>';
    }else
    {
//--        var iframe = '<iframe frameborder="0" width="' + width + '" height="' + height + '" src="' + url + '" name="iframe_internalbrowser" id="iframe_internalbrowser" style="margin:0px; padding:0px;"></iframe>';
        iframe = '<iframe allow="microphone; camera" frameborder="0" width="' + width + '" height="' + height + '" src="' + url + '" name="iframe_internalbrowser" id="iframe_internalbrowser" style="margin:0px; padding:0px;" sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-top-navigation"></iframe>';
    }

    j$('#page_internalbrowser_content').html(iframe);

    } catch(err) { common.PutToDebugLogException(2, "_internalbrowser: OpenWebpage", err); }
}

var MENUITEM_CLOSE = '#menuitem_internalbrowser_close';

function CreateOptionsMenu (menuId) // adding items to menu, called from html
{
    try{
// remove data transition for windows softphone, because it's slow
    if (common.GetParameter('devicetype') === common.DEVICE_WIN_SOFTPHONE())
    {
        j$( "#btn_internalbrowser_menu" ).removeAttr('data-transition');
    }

    if ( common.isNull(menuId) || menuId.lenght < 1 ) { common.PutToDebugLog(2, "ERROR, _internalbrowser: CreateOptionsMenu menuid null"); return; }

    if (j$(menuId).length <= 0) { common.PutToDebugLog(2, "ERROR, _internalbrowser: CreateOptionsMenu can't get reference to Menu"); return; }
    
    if (menuId.charAt(0) !== '#') { menuId = '#' + menuId; }
    
    j$(menuId).html('');
    j$(menuId).append( '<li id="' + MENUITEM_CLOSE + '"><a data-rel="back">' + stringres.get('menu_close') + '</a></li>' ).listview('refresh');

    return true;
    
    } catch(err) { common.PutToDebugLogException(2, "_internalbrowser: CreateOptionsMenu", err); }
    
    return false;
}

function MenuItemSelected(itemid)
{
    try{
    if (common.isNull(itemid) || itemid.length < 1) { return; }
    
    j$( '#internalbrowser_menu' ).on( 'popupafterclose', function( event )
    {
        j$( '#internalbrowser_menu' ).off( 'popupafterclose' );
        
        switch (itemid)
        {
            case MENUITEM_CLOSE:
                CloseBrowser();
                break;
        }
    });
    } catch(err) { common.PutToDebugLogException(2, "_internalbrowser: MenuItemSelected", err); }
}

function CloseBrowser()
{
    try{
    if (lastpage.length < 2)
    {
        j$.mobile.back();

        common.PutToDebugLog(5, 'EVENT, _internalbrowser: CloseBrowser back');
    }else
    {
        j$.mobile.changePage("#" + lastpage, { transition: "pop", role: "page" });
        
        common.PutToDebugLog(5, 'EVENT, _internalbrowser: CloseBrowser changepage: ' + lastpage);
    }
    } catch(err) { common.PutToDebugLogException(2, "_internalbrowser: CloseBrowser", err); }
}

function onStop(event)
{
    try{
    common.PutToDebugLog(4, "EVENT, _internalbrowser: onStop");
    global.isInternalbrowserStarted = false;
    
    j$('#page_internalbrowser_content').html('');
    
    } catch(err) { common.PutToDebugLogException(2, "_internalbrowser: onStop", err); }
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