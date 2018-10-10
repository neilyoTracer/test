/* global j$, common */

// Customizable page: extra4
wpa._extra4 = (function ()
{

/** Page navigation can be done by calling jQuery mobile "changePage()" method: 
j$.mobile.changePage("#PAGE_ID", { transition: "none", role: "page" });
Example: j$.mobile.changePage("#page_extra4", { transition: "none", role: "page" });
To "close" this page and return to the previous page, call jQuery mobile method:  j$.mobile.back();
*/

/** !!! IMPORTANT NOTES:
1. The webphone is a single page application built using jQuery mobile framework.
    Every jQuery mobile "page" defined in softphone.html has a corresponding Javascript file in /softphone/ directory.
    Pages in softphone.html are <DIV> elements with the following attribute: data-role="page"
2. jQuery namespace within the webphone is changed from "$"  to  "j$"
*/

/** This lifecycle function is called only once per session, when the user navigates to the page for the first time.
* This is where most initialization should go: attaching event listeners, initializing static page content, etc.
*/
function onCreate (event)
{
    try{
    common.PutToDebugLog(4, "EVENT, _extra4: onCreate");

    j$('#extra4_menu_ul').on('click', 'li', function(event)
    {
        MenuItemSelected(j$(this).attr('id'));
    });
    j$("#btn_extra4_menu").on("click", function() { CreateOptionsMenu('#extra4_menu_ul'); });
    
    // set page title
    j$("#extra4_title").html('Page Extra 4');
        
    } catch(err) { common.PutToDebugLogException(2, "_extra4: onCreate", err); }
}

/** This lifecycle function is called every time the user navigates to this page.
* This is where dynamic content can be added/refreshed.
*/
function onStart(event)
{
    try{
    common.PutToDebugLog(4, "EVENT, _extra4: onStart");

    // set back button text
    j$('#extra4_btnback').html('< Go back');
    
    MeasureExtra4();
    PopulateData();
    
    } catch(err) { common.PutToDebugLogException(2, "_extra4: onStart", err); }
}

/** resolve window height size/resize changes */
function MeasureExtra4()
{
    j$('#page_extra4').css('min-height', 'auto'); // must be set when softphone is skin in div

    var contentHeight = common.GetDeviceHeight() - j$("#extra4_header").height() - 3;
    j$("#page_extra4_content").height(contentHeight);
}

/** dynamically add content to page */
function PopulateData()
{
    try{
    var pageContent = '<p>Content data of page Extra 4</p>';
    
    j$("#page_extra4_content").html(pageContent);

    } catch(err) { common.PutToDebugLogException(2, "_extra4: PopulateData", err); }
}

/** adding menu items
this function will be called every time the user clicks on the "Menu" button in the top-right corner of the page
*/
var MENUITEM_EXTRA1_BACK = '#menuitem_extra4_back';
function CreateOptionsMenu (menuId) // adding items to menu, called from html
{
    try{
    if ( common.isNull(menuId) || menuId.lenght < 1 ) { common.PutToDebugLog(2, "ERROR, _extra4: CreateOptionsMenu menuid null"); return; }
    if (j$(menuId).length <= 0) { common.PutToDebugLog(2, "ERROR, _extra4: CreateOptionsMenu can't get reference to Menu"); return; }
    
    if (menuId.charAt(0) !== '#') { menuId = '#' + menuId; }
    j$(menuId).html('');

// add menu items
    var itemTitle = 'Go back';
    j$(menuId).append( '<li id="' + MENUITEM_EXTRA1_BACK + '"><a data-rel="back">' + itemTitle + '</a></li>' ).listview('refresh');

    } catch(err) { common.PutToDebugLogException(2, "_extra4: CreateOptionsMenu", err); }
}

/**
handle Menu actions here
called when user clicks on a Menu item
 */
function MenuItemSelected(itemid)
{
    try{
    if (common.isNull(itemid) || itemid.length < 1) { return; }
    
    j$( '#extra4_menu' ).on( 'popupafterclose', function( event )
    {
        j$( '#extra4_menu' ).off( 'popupafterclose' );
        
        switch (itemid)
        {
            case MENUITEM_EXTRA1_BACK:
                MenuActionGoBack();
                break;
        }
    });
    } catch(err) { common.PutToDebugLogException(2, "_extra4: MenuItemSelected", err); }
}

function MenuActionGoBack() // go back to previous page
{
    j$.mobile.back();
}

/** This lifecycle function is called every time the user navigates away from this page.
* This is where you can save data that the user modified, clear dynamically added page content, etc.
*/
function onStop(event)
{
    try{
    common.PutToDebugLog(4, "EVENT, _extra4: onStop");

    // clear page content
    j$("#page_extra_content").html('');
    
    } catch(err) { common.PutToDebugLogException(2, "_extra4: onStop", err); }
}

// public members and methods
return {
    onCreate: onCreate,
    onStart: onStart,
    onStop: onStop,
};
})();