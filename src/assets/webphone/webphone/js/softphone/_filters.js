// Filters page
//--define(['jquery', 'common', 'stringres', 'global'], function($, common, stringres, global)
wpa._filters = (function ()
{

var filterL = null; // [ [40,00,6,12],[+40,,5,10] ]

function onCreate (event) // called only once - bind events here
{
    try{
    common.PutToDebugLog(4, "EVENT, _filters: onCreate");

    j$('#filters_list').on('click', '.ch_anchor', function(event)
    {
        OnListItemClick(j$(this).attr('id'));
    });

    j$('#filters_list').on('click', '.ch_menu', function(event)
    {
        OnListItemClick(j$(this).attr('id'));
    });
    
    j$( window ).resize(function() // window resize handling
    {
        if (j$.mobile.activePage.attr('id') === 'page_filters')
        {
            MeasureFilterslist();
        }
    });
    
    j$('#filters_menu_ul').on('click', 'li', function(event)
    {
        MenuItemSelected(j$(this).attr('id'));
    });
    j$("#btn_filters_menu").on("click", function() { CreateOptionsMenu('#filters_menu_ul'); });
    j$("#btn_filters_menu").attr("title", stringres.get("hint_menu"));
    
    j$("#btn_add_filters").on("click", function() { AddFilter(false, null); });
    
    } catch(err) { common.PutToDebugLogException(2, "_filters: onCreate", err); }
}

function onStart(event)
{
    try{
    common.PutToDebugLog(4, "EVENT, _filters: onStart");
    global.isFiltersStarted = true;
    
    //--j$("#phone_number").attr("placeholder", stringres.get("phone_nr"));

    if (!common.isNull(document.getElementById('filters_title')))
    {
        document.getElementById('filters_title').innerHTML = stringres.get('filters_title');
    }
    j$("#filters_title").attr("title", stringres.get("hint_page"));
    j$("#filters_label_add").html(stringres.get("filters_add_label"));
    
    j$(".separator_line_thick").css( 'background-color', common.HoverCalc(common.getBgColor('#page_filters'), -30) );
    
    if (!common.isNull(document.getElementById('filters_btnback')))
    {
        document.getElementById('filters_btnback').innerHTML = '<b>&LT;</b>&nbsp;' + stringres.get("go_back_btn_txt");
    }
    
// needed for proper display and scrolling of listview
    MeasureFilterslist();
    
    // fix for IE 10
    if (common.IsIeVersion(10)) { j$("#filters_list").children().css('line-height', 'normal'); }

    PopulateList();
    
    } catch(err) { common.PutToDebugLogException(2, "_filters: onStart", err); }
}

function MeasureFilterslist() // resolve window height size change
{
    try{
    //--var pgh = common.GetDeviceHeight() - 1; j$('#page_filters').css('min-height', pgh + 'px'); // must be set when softphone is skin in div
    j$('#page_filters').css('min-height', 'auto'); // must be set when softphone is skin in div
    
// handle page height
    var heightTemp = common.GetDeviceHeight() - j$("#filters_header").height() - j$("#filters_add_section").height();
    var margin = common.StrToIntPx( j$("#filters_add_section").css("margin-top") ) + common.StrToIntPx( j$("#filters_add_section").css("margin-bottom") );

    heightTemp = heightTemp - margin - 3;
    j$("#filters_list").height(heightTemp);
    
    } catch(err) { common.PutToDebugLogException(2, "_filters: MeasureFilterslist", err); }
}

function PopulateList() // :no return value;  // onlyonserver: display only contacts on server. Controlled by toggle button
{
    try{
    if ( common.isNull(document.getElementById('filters_list')) )
    {
        common.PutToDebugLog(2, "ERROR, _filters: PopulateList listelement is null");
        return;
    }
    
    ReadFilters();
    var listview = '';
    
    if (common.isNull(filterL) || filterL.length < 1)
    {
        j$('#filters_list').html('');
        j$('#filters_list').append(listview).listview('refresh');
        common.PutToDebugLog(2, "EVENT, _filters: PopulateList no filters to display");
        return;
    }
    
    var template = '' +
            '<li data-theme="b">' +
                '<a id="filteritem_[FID]" class="ch_anchor mlistitem" title="' + stringres.get('filter_edit_hint') + '">' +
                    '<div class="item_container">' +
                        '<div class="r_what">' + stringres.get('filter_start') + ': <span>[WHAT]</span></div>' +
                        '<div class="r_with">' + stringres.get('filter_replace') + ': <span>[WITH]</span></div>' +
                        '<div class="r_minlen">' + stringres.get('filter_minlen') + ': <span>[MINL]</span></div>' +
                        '<div class="r_maxlen">' + stringres.get('filter_maxlen') + ': <span>[MAXL]</span></div>' +
                    '</div>' + 
                '</a>' +
                '<a id="filtermenu_[FID]" class="ch_menu mlistitem">' + stringres.get('filter_delete_hint') + '</a>' +
            '</li>';
    
    for (var i = 0; i < filterL.length; i++)
    {
        var one = filterL[i];
        
        if (common.isNull(one[common.F_WHAT])) { one[common.F_WHAT] = ''; }
        if (common.isNull(one[common.F_WITH])) { one[common.F_WITH] = ''; }
        if (common.isNull(one[common.F_MIN])) { one[common.F_MIN] = ''; }
        if (common.isNull(one[common.F_MAX])) { one[common.F_MAX] = ''; }
        
        var htmlitem = common.ReplaceAll(template, '[FID]', i.toString());
        htmlitem = htmlitem.replace('[WHAT]', one[common.F_WHAT]);
        htmlitem = htmlitem.replace('[WITH]', one[common.F_WITH]);
        htmlitem = htmlitem.replace('[MINL]', one[common.F_MIN]);
        htmlitem = htmlitem.replace('[MAXL]', one[common.F_MAX]);
        
        listview = listview + htmlitem;
    }
    
    j$('#filters_list').html('');
    j$('#filters_list').append(listview).listview('refresh');
    
    } catch(err) { common.PutToDebugLogException(2, "_filters: PopulateList", err); }
}

var trigerredlist = false; // handle multiple clicks
function OnListItemClick (id) // :no return value
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
        common.PutToDebugLog(2, 'ERROR, _filters OnListItemClick id is NULL');
        return;
    }
    
    var fid = '';
    var pos = id.indexOf('_');
    if (pos < 2)
    {
        common.PutToDebugLog(2, 'ERROR, _filters OnListItemClick invalid id');
        return;
    }
    
    fid = common.Trim(id.substring(pos + 1));
    var idint = 0;
    
    try{
        idint = common.StrToInt( common.Trim(fid) );

    } catch(errin1) { common.PutToDebugLogException(2, "_filters: OnListItemClick convert fid", errin1); }
    
    if (id.indexOf('filteritem') === 0) // means edit rule
    {
        AddFilter(true, idint)
    }
    else if (id.indexOf('filtermen') === 0) // (menu) in this case delete rule
    {
        DeleteFilter(idint);
    }
    } catch(err) { common.PutToDebugLogException(2, "_filters: OnListItemClick", err); }
}

function AddFilter(isedit, fid, popupafterclose)
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
    
    var fwhat_init = '';
    var fwith_init = '';
    var minl_init = '';
    var maxl_init = '';
    
    if (isedit === true && !common.isNull(fid) && common.IsNumber(fid))
    {
        var edititem = filterL[fid];
        
        fwhat_init = edititem[common.F_WHAT];
        fwith_init = edititem[common.F_WITH];
        minl_init = edititem[common.F_MIN];
        maxl_init = edititem[common.F_MAX];
        
        if (common.isNull(fwhat_init)) { fwhat_init = ''; }
        if (common.isNull(fwith_init)) { fwith_init = ''; }
        if (common.isNull(minl_init)) { minl_init = ''; }
        if (common.isNull(maxl_init)) { maxl_init = ''; }
    }
    
    var template = '' +
'<div id="filter_popup" data-role="popup" class="ui-content messagePopup" data-overlay-theme="a" data-theme="a" style="width:' + popupWidth + 'px; max-width:' + popupWidth + 'px; min-width: ' + Math.floor(popupWidth * 0.6) + 'px;">' +

    '<div data-role="header" data-theme="b">' +
        '<a href="javascript:;" data-role="button" data-icon="delete" data-iconpos="notext" class="ui-btn-right closePopup">Close</a>' +
        '<h1 class="adialog_title">' + stringres.get('filters_add_rule') + '</h1>' +
    '</div>' +
    '<div role="main" class="ui-content adialog_content" style="padding: 0; margin: 0; width: 100%;">' +
        
        '<div class="filter_left_container">'+
            '<label style="width: 100%">' + stringres.get('filter_start') + ':</label>' +
        '</div>' +
        '<div class="filter_right_container">' +
            '<input name="filter_what" id="filter_what" data-highlight="true" data-mini="true" value="' + fwhat_init + '" type="text" autocapitalize="off">' +
        '</div>' +
        
        '<div class="filter_left_container">'+
            '<label style="width: 100%">' + stringres.get('filter_replace') + ':</label>' +
        '</div>' +
        '<div class="filter_right_container">' +
            '<input name="filter_with" id="filter_with" data-highlight="true" data-mini="true" value="' + fwith_init + '" type="text" autocapitalize="off">' +
        '</div>' +
        
        '<div class="filter_left_container">'+
            '<label style="width: 100%">' + stringres.get('filter_minlen') + ':</label>' +
        '</div>' +
        '<div class="filter_right_container">' +
            '<input name="filter_min" id="filter_min" data-highlight="true" data-mini="true" value="' + minl_init + '" type="text" autocapitalize="off">' +
        '</div>' +
        
        '<div class="filter_left_container">'+
            '<label style="width: 100%">' + stringres.get('filter_maxlen') + ':</label>' +
        '</div>' +
        '<div class="filter_right_container">' +
            '<input name="filter_max" id="filter_max" data-highlight="true" data-mini="true" value="' + maxl_init + '" type="text" autocapitalize="off">' +
        '</div>' +

//        '<a href="javascript:;" class="ui-btn ui-corner-all ui-shadow ui-btn-inline ui-btn-b" data-rel="back">' + stringres.get('btn_close') + '</a>' +
//        '<a href="javascript:;" class="ui-btn ui-corner-all ui-shadow ui-btn-inline ui-btn-b" data-rel="back" data-transition="flow">Delete</a>' +
    '</div>' +
    '<div data-role="footer" data-theme="b" class="adialog_footer">' +
        '<a href="javascript:;" id="adialog_positive" class="ui-btn ui-corner-all ui-shadow ui-btn-inline ui-btn-b adialog_2button" data-rel="back" data-transition="flow">' + stringres.get('btn_ok') + '</a>' +
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
    
    
    j$.mobile.activePage.find(".messagePopup").popup().popup("open").bind(
    {
        popupafterclose: function ()
        {
            j$(this).unbind("popupafterclose").remove();
            popupafterclose();
        }
    });
    
    j$('#adialog_positive').on('click', function (event)
    {
        common.PutToDebugLog(5,"EVENT, _filters AddFilter ok on click");
        
        var fwhat = j$('#filter_what').val();
        var fwith = j$('#filter_with').val();
        var minl = j$('#filter_min').val();
        var maxl = j$('#filter_max').val();
        
        if (common.isNull(fwhat)) { fwhat = ''; }
        if (common.isNull(fwith)) { fwith = ''; }
        if (common.isNull(minl)) { minl = ''; }
        if (common.isNull(maxl)) { maxl = ''; }
        
        fwhat = common.Trim(fwhat);
        fwith = common.Trim(fwith);
        minl = common.Trim(minl);
        maxl = common.Trim(maxl);
        
        fwhat = common.ReplaceAll(fwhat, ',', '_');     fwhat = common.ReplaceAll(fwhat, ';', '_');
        fwith = common.ReplaceAll(fwith, ',', '_');     fwith = common.ReplaceAll(fwith, ';', '_');
        if (!common.IsNumber(minl)) { minl = ''; }
        if (!common.IsNumber(maxl)) { maxl = ''; }
        
        if (fwhat.length < 1 && fwith.length < 1)
        {
            common.ShowToast(stringres.get('filter_warning'));
            return;
        }
        
        // add filter to list
        var item = [];
        item[common.F_WHAT] = fwhat;
        item[common.F_WITH] = fwith;
        item[common.F_MIN] = minl;
        item[common.F_MAX] = maxl;
        
        if (isedit === true && !common.isNull(fid) && common.IsNumber(fid))
        {
            filterL[fid] = item;
        }else
        {
            filterL.push(item);
        }
        
        SaveFilters();
        
        PopulateList();
    });
    
    } catch(err) { common.PutToDebugLogException(2, "_filters: AddFilter", err); }
}

function DeleteFilter(fid)
{
    try{
    if (common.isNull(fid) || !common.IsNumber(fid) || fid < 0 || fid >= filterL.length)
    {
        common.PutToDebugLog(2, 'ERROR, _filters: DeleteFilter invalid id: ' + fid);
        return;
    }
    
    filterL.splice(fid, 1);
    
    SaveFilters();
    PopulateList();
    
    } catch(err) { common.PutToDebugLogException(2, "_filters: DeleteFilter", err); }
}

function ReadFilters()
{
    try{
    var fval = common.GetParameter2('filters');
/*
    fval = '40,00,6,12;+40,,5,10';
*/

    filterL = [];
    if (common.isNull(fval) || fval.length < 1)
    {
        common.PutToDebugLog(3, 'ReadFilters, nothing to read');
        return;
    }
    
    var itemsL = fval.split(';');
    
    if (common.isNull(itemsL) || itemsL.length < 1) { return; }
    
    for (var i = 0; i < itemsL.length; i++)
    {
        if (common.isNull(itemsL[i]) || itemsL[i].length < 3) { continue; }
        var oneitem = itemsL[i].split(',');
        
        if (common.isNull(oneitem) || oneitem.length !== 4) { continue; }
        
        filterL.push(oneitem);
    }
    } catch(err) { common.PutToDebugLogException(2, "_filters: ReadFilters", err); }
}

function SaveFilters()
{
    try{
    if (common.isNull(filterL))
    {
        common.PutToDebugLog(3, 'SaveFilters, nothing to save');
        return;
    }
    
    var fval = '';
    for (var i = 0; i < filterL.length; i++)
    {
        var item = filterL[i];
        if (common.isNull(item) || item.length < 3) { continue; }
        
        if (fval.length > 0) { fval = fval + ';'; }
        
        fval = fval + item[common.F_WHAT] + ',' + item[common.F_WITH] + ',' + item[common.F_MIN] + ',' + item[common.F_MAX];
    }
    
    if (common.isNull(fval)) { fval = ''; }
    
    common.SaveParameter('filters', fval);
    
    } catch(err) { common.PutToDebugLogException(2, "_filters: SaveFilters", err); }
}

var MENUITEM_FILTERS_CLOSE = '#menuitem_filters_close';

function CreateOptionsMenu (menuId) // adding items to menu, called from html
{
    try{
// remove data transition for windows softphone, because it's slow
    if (common.IsWindowsSoftphone())
    {
        j$( "#btn_filters_menu" ).removeAttr('data-transition');
    }

    if ( common.isNull(menuId) || menuId.lenght < 1 ) { common.PutToDebugLog(2, "ERROR, _filters: CreateOptionsMenu menuid null"); return; }

    if (j$(menuId).length <= 0) { common.PutToDebugLog(2, "ERROR, _filters: CreateOptionsMenu can't get reference to Menu"); return; }
    
    if (menuId.charAt(0) !== '#') { menuId = '#' + menuId; }
    
    j$(menuId).html('');
    j$(menuId).append( '<li id="' + MENUITEM_FILTERS_CLOSE + '"><a data-rel="back">' + stringres.get('menu_close') + '</a></li>' ).listview('refresh');

    return true;
    
    } catch(err) { common.PutToDebugLogException(2, "_filters: CreateOptionsMenu", err); }
    
    return false;
}

function MenuItemSelected(itemid)
{
    try{
    if (common.isNull(itemid) || itemid.length < 1) { return; }
    
    j$( '#filters_menu' ).on( 'popupafterclose', function( event )
    {
        j$( '#filters_menu' ).off( 'popupafterclose' );
        
        switch (itemid)
        {
            case MENUITEM_FILTERS_CLOSE:
                j$.mobile.back();
                break;
        }
    });
    } catch(err) { common.PutToDebugLogException(2, "_filters: MenuItemSelected", err); }
}

function onStop(event)
{
    try{
    common.PutToDebugLog(4, "EVENT, _filters: onStop");
    global.isFiltersStarted = false;
    
    } catch(err) { common.PutToDebugLogException(2, "_filters: onStop", err); }
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