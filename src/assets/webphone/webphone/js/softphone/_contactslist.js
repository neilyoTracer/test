// Contacts List page
//--define(['jquery', 'common', 'stringres', 'global'], function($, common, stringres, global)
wpa._contactslist = (function ()
{
function onCreate (event) // called only once - bind events here
{
    try{
    common.PutToDebugLog(4, "EVENT, _contactslist: onCreate");
    
//-- navigation done with js, so target URL will not be displayed in browser statusbar
    j$("#nav_ct_dialpad").on("click", function()
    {
        j$.mobile.changePage("#page_dialpad", { transition: "none", role: "page", reverse: "true" });
    });
    j$("#nav_ct_callhistory").on("click", function()
    {
        j$.mobile.changePage("#page_callhistorylist", { transition: "none", role: "page" });
    });
    
    j$("#nav_ct_dialpad").attr("title", stringres.get("hint_dialpad"));
    j$("#nav_ct_contacts").attr("title", stringres.get("hint_contacts"));
    j$("#nav_ct_callhistory").attr("title", stringres.get("hint_callhistory"));
    
    j$("#status_contactslist").attr("title", stringres.get("hint_status"));
    j$("#curr_user_contactslist").attr("title", stringres.get("hint_curr_user"));
    j$("#contactslist_not_btn").on("click", function()
    {
        common.SaveParameter('notification_count2', 0);
        common.ShowNotifications2(); // repopulate notifications (hide red dot number)
    });

    
    j$('#contactslist_list').on('click', 'li', function(event)
    {
        OnListItemClick(j$(this).attr('id'));
    });
    
    j$('#contactslist_list').on('taphold', 'li', function(event)
    {
        OnListItemLongClick(j$(this).attr('id'));
    });
    
    j$( window ).resize(function() // window resize handling
    {
        if (j$.mobile.activePage.attr('id') === 'page_contactslist')
        {
            MeasureContacslist();
        }
    });
    
    j$('#contactslist_menu_ul').on('click', 'li', function(event)
    {
        MenuItemSelected(j$(this).attr('id'));
    });
    j$("#btn_contactslist_menu").on("click", function() { CreateOptionsMenu('#contactslist_menu_ul'); });
    j$("#btn_contactslist_menu").attr("title", stringres.get("hint_menu"));
    
    var advuri = common.GetParameter('advertisement');
    if (!common.isNull(advuri) && advuri.length > 5)
    {
        j$('#advert_contactslist_frame').attr('src', advuri);
        j$('#advert_contactslist').show();
    }
    
    if (common.GetParameterBool('contacttoggle', false) === true)
    {
        var toggle_layout = document.getElementById('togglecontact_container');
        
        if (!common.isNull(toggle_layout))
        {
            toggle_layout.style.display = 'block';
        }
    }

    j$('select#togglecontact').change(function()
    {
        var onlyserver = false;
        var val = j$(this).val();
        if (!common.isNull(val) && val == 'on')
        {
            onlyserver = true;
        }
        
        PopulateList(onlyserver);
    });
    
    if (common.UsePresence2() === true)
    {
        j$("#contactslist_additional_header_left").on("click", function()
        {
            common.PresenceSelector('contactslist');
        });
        j$("#contactslist_additional_header_left").css("cursor", "pointer");
    }
    
    } catch(err) { common.PutToDebugLogException(2, "_contactslist: onCreate", err); }
}

function onStart(event)
{
    try{
    common.PutToDebugLog(4, "EVENT, _contactslist: onStart");
    global.isContactslistStarted = true;
    
    if (common.HideSettings('page_history', '', 'page_history', true))
    {
        j$("#li_nav_ct_ch").remove();
        var count = j$("#ul_nav_ct").children().length;
        var tabwidth = Math.floor(100 / count);
        
        j$('#ul_nav_ct').children('li').each(function ()
        {
            j$(this).css('width', tabwidth + '%');
        });
        
        if (count < 2)
        {
            j$('#ul_nav_ct').remove();
            MeasureDialPad();
        }
    }
    
//--    j$("#phone_number").attr("placeholder", stringres.get("phone_nr"));
    
    if (common.GetParameter('devicetype') !== common.DEVICE_WIN_SOFTPHONE())
    {
        document.getElementById("app_name_contactslist").innerHTML = common.GetBrandName();
    }
    j$("#contactslist_list").attr("data-filter-placeholder", stringres.get("ct_search_hint"));

    if (!common.isNull(document.getElementById('ctlist_title')))
    {
        document.getElementById('ctlist_title').innerHTML = stringres.get('ctlist_title');
    }
    j$("#ctlist_title").attr("title", stringres.get("hint_page"));
    
    var curruser = common.GetParameter('sipusername');
    if (!common.isNull(curruser) && curruser.length > 0) { j$('#curr_user_contactslist').html(curruser); }
// set status width so it's uses all space to curr_user
    var statwidth = common.GetDeviceWidth() - j$('#curr_user_contactslist').width() - 25;
    if (!common.isNull(statwidth) && common.IsNumber(statwidth))
    {
        j$('#status_contactslist').width(statwidth);
    }

    j$(".separator_line_thick").css( 'background-color', common.HoverCalc(common.getBgColor('#page_contactslist'), -30) );
    
    if ((common.GetParameter('header')).length > 2)
    {
        j$('#headertext_contactslist').show();
        j$('#headertext_contactslist').html(common.GetParameter('header'));
    }else
    {
        j$('#headertext_contactslist').hide();
    }
    if ((common.GetParameter('footer')).length > 2)
    {
        j$('#footertext_contactslist').show();
        j$('#footertext_contactslist').html(common.GetParameter('footer'));
    }else
    {
        j$('#footertext_contactslist').hide();
    }
    
    j$('#contactslist_notification_list').on('click', '.nt_anchor', function(event)
    {
        j$("#contactslist_not").panel( "close" );
        common.NotificationOnClick2(j$(this).attr('id'), false);
    });
    j$('#contactslist_notification_list').on('click', '.nt_menu', function(event)
    {
        j$("#contactslist_not").panel( "close" );
        common.NotificationOnClick2(j$(this).attr('id'), true);
    });
    
    
    if (common.GetConfigInt('brandid', -1) === 58) //-- enikma
    {
        var logodiv = document.getElementById('app_name_contactslist');
        if (!common.isNull(logodiv))
        {
            var middle = document.getElementById('ctlist_title');
            logodiv.style.display = 'inline';
            if (!common.isNull(middle)) { middle.style.display = 'none'; }
            document.getElementById('contactslist_additional_header_left').style.width = '65%';
            logodiv.innerHTML = '<img src="' + common.GetElementSource() + 'images/logo.png" style="border: 0;">&nbsp;&nbsp;&nbsp;<div class="adhead_custom_brand" style=""><b>eNikMa</b> Unified Comm</div>';
        }
    }
    
    
    common.ShowNotifications2();
// needed for proper display and scrolling of listview
    MeasureContacslist();
    
    // fix for IE 10
    if (common.IsIeVersion(10)) { j$("#contactslist_list").children().css('line-height', 'normal'); }
    if (common.IsIeVersion(10)) { j$("#contactslist_notification_list").children().css('line-height', 'normal'); }
    j$("#contactslist_notification_list").height(common.GetDeviceHeight() - 55);

    LoadContacts();
    
    common.ShowOfferSaveContact();
    
    } catch(err) { common.PutToDebugLogException(2, "_contactslist: onStart", err); }
}

function MeasureContacslist() // resolve window height size change
{
    try{
//--    var pgh = common.GetDeviceHeight() - 1; j$('#page_contactslist').css('min-height', pgh + 'px'); // must be set when softphone is skin in div
    j$('#page_contactslist').css('min-height', 'auto'); // must be set when softphone is skin in div

// handle notifiaction      additional_header_right
    var notwidth = common.GetDeviceWidth() - j$("#contactslist_additional_header_left").width() - j$("#contactslist_additional_header_right").width();
    var margin = common.StrToIntPx( j$("#contactslist_additional_header_left").css("margin-left") );
    
    if (common.isNull(margin) || margin === 0) { margin = 10; }
    margin = Math.ceil( margin * 6 );
    notwidth = Math.floor(notwidth - margin) - 20;

    j$("#contactslist_notification").width(notwidth);
    j$("#contactslist_notification").height( Math.floor( j$("#contactslist_additional_header_left").height() ) );
    
// handle page height
    var heightTemp = common.GetDeviceHeight() - j$("#contactslist_header").height()/* - j$("form.ui-filterable").height()*/ - common.StrToIntPx(j$(".ui-input-search").css("border-top-width")) - common.StrToIntPx(j$(".ui-input-search").css("border-bottom-width"));
        
//-- not working concictently, many times height is 0

//--    common.PutToDebugLog(2, 'j$(".ui-input-search").height(): ' + j$(".ui-input-search").height());
//--    common.PutToDebugLog(2, 'j$(".ui-listview-filter").height(): ' + j$(".ui-listview-filter").height());
    
    heightTemp = heightTemp - 35;
    
    var searchmargin = common.StrToIntPx( j$(".ui-input-search").css("margin-top") );
    heightTemp = heightTemp - searchmargin - searchmargin;
    heightTemp = heightTemp - 3;
    
    if (j$('#footertext_contactslist').is(':visible')) { heightTemp = heightTemp - j$("#footertext_contactslist").height(); }
    
    if (j$('#advert_contactslist').is(':visible')) { heightTemp = heightTemp - j$("#advert_contactslist").height(); }
    
    if (j$('#togglecontact_container').is(':visible')) { heightTemp = heightTemp - j$("#togglecontact_container").height(); }
    
    j$("#contactslist_list").height(heightTemp);
    
    
//--    var brandW = Math.floor(common.GetDeviceWidth() / 4.6);
//--    j$("#app_name_contactslist").width(brandW);
    
    // if brandname does not fit, then hide brandname
    if (global.bname_charcount > 0 && common.GetBrandName().length > global.bname_charcount)
    {
        j$('#app_name_contactslist').html('');
        j$('#contactslist_additional_header_left').width('35%');
    }
    var brandW = j$("#contactslist_additional_header_left").width() - 5;
    if (j$('#contactslist_presence').is(':visible')) { brandW = brandW - j$("#contactslist_presence").width(); }
    j$("#app_name_contactslist").width(brandW);
    
    } catch(err) { common.PutToDebugLogException(2, "_contactslist: MeasureContacslist", err); }
}

function LoadContacts()
{
    try{
    if (global.isdebugversionakos)
    {
//--        if ( common.isNull(global.ctlist) || global.ctlist.length < 1 )
//--        {
//--            global.ctlist = [];
            // String Name, String[] {numbers/sip uris}, String[] {number types}, int usage, long lastmodified, int delete flag, int isfavorit, String email, String address, String notes, String website
//--            var ctitem = ['Ambrus Akos', ['8888', '0268123456', '13245679'], ['home', 'work', 'other'], '0', '13464346', '0', '0'];

//--            var ctitem2 = ['Ambrus Tunde', ['5555', '987654'], ['other', 'fax_home'], '0', '23464346', '0', '0'];
//--            var ctitem3 = ['Mariska Mari', ['123456', '4444'], ['other', 'fax_home'], '0', '23464346', '0', '0'];

//--            global.ctlist.push(ctitem); global.ctlist.push(ctitem2); global.ctlist.push(ctitem3);
            
//--            for (var i = 0; i < 5; i++)
//--            {
//--                var ctitem_generated = ['Test_' + i, ['123456_' + i, '987654_' + i], ['other', 'fax_home'], '0', '23464346', '0', '0'];
//--                global.ctlist.push(ctitem_generated);
//--            }
//--        }
    }
    
    if (common.isNull(global.ctlist) || global.ctlist.length < 1)
    {
    // add special contacts
        if (common.IsMizuWebRTCEmbeddedServer() === true)
        {
            var ctitem = null;
            ctitem = ['Echo delayed', ['5004', 'echod'], ['phone', 'sip'], '0', '0', '0', '0'];     global.ctlist.push(ctitem);
            ctitem = ['Echo', ['5005', 'echo'], ['phone', 'sip'], '0', '0', '0', '0'];     global.ctlist.push(ctitem);
            ctitem = ['Funny', ['5003', 'funny'], ['phone', 'sip'], '0', '0', '0', '0'];     global.ctlist.push(ctitem);
            ctitem = ['Music', ['5002', 'music'], ['phone', 'sip'], '0', '0', '0', '0'];     global.ctlist.push(ctitem);
            ctitem = ['Playback', ['5011', 'playback'], ['phone', 'sip'], '0', '0', '0', '0'];     global.ctlist.push(ctitem);
            ctitem = ['Record', ['5010', 'record'], ['phone', 'sip'], '0', '0', '0', '0'];     global.ctlist.push(ctitem);
            ctitem = ['Redial', ['5901', 'redial'], ['phone', 'sip'], '0', '0', '0', '0'];     global.ctlist.push(ctitem);
            
            ctitem = ['Voicemail', ['5001', 'voicemail'], ['phone', 'sip'], '0', '0', '0', '0'];     global.ctlist.push(ctitem);
        }else
        {
            ctitem = ['Voicemail', [], [], '0', '0', '0', '0'];     global.ctlist.push(ctitem);
        }
        
        AddDefContacts();
        
        common.GetContacts(function (success)
        {
            if (!success)
            {
                common.PutToDebugLog(2, 'ERROR, _contactslist: LoadContacts failed');
            }

            PopulateList(false);
        });
    }else
    {
        PopulateList(false);
    }
    } catch(err) { common.PutToDebugLogException(2, "_contactslist: LoadContacts", err); }
}

function AddDefContacts() // add custom(def) contacts to contactslist and reload contacts list
{
    try{
// add default contacts if defined (customization)
    // set one or more default contacts. Name and number separated by comma and contacts separated by semicolon:
            // example: defcontacts: 'John Doe,12121;Jill Doe,231231'
    var ctitem = null;
    var defct = common.GetConfig('defcontacts');
    if (!common.isNull(webphone_api.parameters['defcontacts'])) { defct = webphone_api.parameters['defcontacts']; }
    if (!common.isNull(defct) && defct.length > 2)
    {
        var darr = defct.split(';');
        if (!common.isNull(darr))
        {
            for (var i = 0; i < darr.length; i++)
            {
                if (common.isNull(darr[i]) || darr[i].length < 3 || darr[i].indexOf(',') < 1) { continue; }

                var name = common.Trim(darr[i].substring(0, darr[i].indexOf(',')));
                var nr = common.Trim(darr[i].substring(darr[i].indexOf(',') + 1));
                if (common.isNull(nr)) { nr = ''; }
                nr = common.ReplaceAll(nr, ',', '');
                nr = common.Trim(nr);

                var type = 'sip';
                if (common.IsNumber(nr)) { type = 'phone'; }

                ctitem = [name, [nr], [type], '0', '0', '0', '0'];     global.ctlist.push(ctitem);
            }
        }
    }
    } catch(err) { common.PutToDebugLogException(2, "_contactslist: AddDefContacts", err); }
}

var ctlistLocal = []; // will display only contacts from this array
function PopulateList(onlyserver) // :no return value;  // onlyonserver: display only contacts on server. Controlled by toggle button
{
    try{
    if ( common.isNull(document.getElementById('contactslist_list')) )
    {
        common.PutToDebugLog(2, "ERROR, _contactslist: PopulateList listelement is null");
        return;
    }
    
    if ( common.isNull(global.ctlist) || global.ctlist.length < 1 )
    {
        var htmlcontent = '<span style="text-shadow:0 0 0;">' + stringres.get('no_contacts_1') + '</span>';
        
        // display sync contacts button
        if (common.GetParameterInt('showsynccontactsmenu', 0) === 0)
        {
            htmlcontent = htmlcontent + '<br /><br /><br />' + '<span style="text-shadow:0 0 0;">' + stringres.get('no_contacts_2') + '</span>';
            
            /*htmlcontent = htmlcontent + '<br /><br /><br />' +
                '<span style="text-shadow:0 0 0;">' + stringres.get('sync_msg') + '</span><br />' +
                '<button id="sync_contacts" class="ui-btn noshadow ui-btn-inline ui-corner-all">' + stringres.get('menu_sync') + '</button>';*/
        }
        
        j$('#contactslist_list').html( htmlcontent );
        

        j$("#sync_contacts").on("click", function()
        {
            common.DownloadContacts();
        });
        
        common.PutToDebugLog(2, "EVENT, _contactslist: PopulateList no contacts");
        return;
    }
    
    common.PutToDebugLog(2, 'EVENT, _contactslist Starting populate list');
    
    ctlistLocal = [];
    
// onlyonserver: display only contacts on server. Controlled by toggle button
    if (onlyserver)
    {
        var servercontacts = common.GetParameter("servercontacts");

        if (common.isNull(servercontacts) || servercontacts.length < 1)
        {
            return;
        }

// remove any item from ctlistLocal, which number is not in serverctL
//--var ctitem = ['Ambrus Akos', ['445566', '0268123456', '13245679'], ['home', 'work', 'other'], '0', '13464346', '0', '0'];
        var serverctL = servercontacts.split(",");

        var ctidx = 0;
        if (common.isNull(serverctL) || serverctL.length < 1)
        {
            ctlistLocal = [];
        }else
        {
            for (var i = 0; i < global.ctlist.length; i++)
            {
                var item = global.ctlist[i];
                if ( common.isNull(item) || item.length < 1 ) { continue; }

                var nrtmp = item[common.CT_NUMBER]; // ['22334455', '0268123456', '13245679']
                var typetmp = item[common.CT_PTYPE]; // ['home', 'work', 'other']
                
                if (common.isNull(nrtmp) || nrtmp.length < 1) { continue; }
                
                var nrnew = [];
                var typenew = [];
                var idx = 0;
                for (var j = 0; j < nrtmp.length; j++)
                {
                    if (serverctL.indexOf(nrtmp[j]) >= 0)
                    {
                        nrnew[idx] = nrtmp[j];
                        typenew[idx] = typetmp[j];
                        idx++;
                    }
                }
                
                if (nrnew.length > 0)
                {
                    item[common.CT_NUMBER] = nrnew.slice();
                    item[common.CT_PTYPE] = typenew.slice();
                    
                    ctlistLocal[ctidx] = item.slice();
                    ctidx++;
                }
            }
        }
    }else // display all contacts, not only server contacts
    {
        // copy array
        ctlistLocal = global.ctlist.slice();
    }
    
    
//--    var template = '<li id="contact_[ID]"><a href="javascript:void(0)" data-transition="slide">[NAME]</a></li>';
    var template = '<li id="contact_[ID]"><a data-transition="slide" class="mlistitem">[NAME]</a></li>';
    var listview = '';
    
    for (var i = 0; i < ctlistLocal.length; i++)
    {
        var item = ctlistLocal[i];
        if ( common.isNull(item) || item.length < 1 ) { continue; }
        
        var ctname = item[common.CT_NAME];
        
        if ( common.isNull(ctname) || ctname.length < 1 )
        {
            var nrlist = item[common.CT_NUMBER];
            
            if ( common.isNull(nrlist) || nrlist.length < 1 || common.isNull(nrlist[0]) || nrlist[0].length < 1 )
            {
                continue;
            }
            
            ctname = nrlist[0];
        }
        
        var lisitem = template.replace('[ID]', i);
        lisitem = lisitem.replace('[NAME]', ctname);
        
        listview = listview + lisitem;
        
//--        common.PutToDebugLog(2, item[0] + ' - ' + item[1] + ' - ' + item[2] + ' - ' + item[3] + ' - ' + item[4] + ' - ' + item[5] + ' - ' + item[6]);
    }
    
    j$('#contactslist_list').html('');
    j$('#contactslist_list').append(listview).listview('refresh');
    
    } catch(err) { common.PutToDebugLogException(2, "_contactslist: PopulateList", err); }
}

function OnListItemClick (id) // :no return value
{
    try{
        
    if (common.isNull(id) || id.length < 1)
    {
        common.PutToDebugLog(2, 'ERROR, _contactslist OnListItemClick id is NULL');
        return;
    }
    
    var ctid = '';
    var pos = id.indexOf('_');
    if (pos < 2)
    {
        common.PutToDebugLog(2, 'ERROR, _contactslist OnListItemClick invalid id');
        return;
    }
    
    ctid = common.Trim(id.substring(pos + 1));
    
// handle voicemail separatelly
//-- voicemail - ha nincs szam, akkor bekerem pont, mind eddig (nem kell tobbet a menu-be)
    var name = ctlistLocal[ctid][common.CT_NAME];
    if (name.toLowerCase() === 'voicemail')
    {
        var nrlist = ctlistLocal[ctid][common.CT_NUMBER];
        if (common.isNull(nrlist) || nrlist.length < 1)
        {
            common.SetVoiceMailNumber(function (vmnr)
            {
                if (!common.isNull(vmnr) && vmnr.length > 0)
                {
                // first delete old Voicemail contact entry
                    for (var i = 0; i < global.ctlist.length; i++)
                    {
                        if (global.ctlist[i][common.CT_NAME] === 'Voicemail')
                        {
                            global.ctlist.splice(i, 1);
                            break;
                        }
                    }
                    
                // then add the new entry with contact number
                    var ctTemp = [];
                    ctTemp[common.CT_NAME] = ctlistLocal[ctid][common.CT_NAME];
                    ctTemp[common.CT_NUMBER] = [vmnr];
                    ctTemp[common.CT_PTYPE] = ctlistLocal[ctid][common.CT_PTYPE];
                    ctTemp[common.CT_USAGE] = ctlistLocal[ctid][common.CT_USAGE];
                    ctTemp[common.CT_LASTMODIF] = ctlistLocal[ctid][common.CT_LASTMODIF];
                    ctTemp[common.CT_DELFLAG] = ctlistLocal[ctid][common.CT_DELFLAG];
                    ctTemp[common.CT_FAV] = ctlistLocal[ctid][common.CT_FAV];
                    ctTemp[common.CT_EMAIL] = ctlistLocal[ctid][common.CT_EMAIL];
                    ctTemp[common.CT_ADDRESS] = ctlistLocal[ctid][common.CT_ADDRESS];
                    ctTemp[common.CT_NOTES] = ctlistLocal[ctid][common.CT_NOTES];
                    ctTemp[common.CT_WEBSITE] = ctlistLocal[ctid][common.CT_WEBSITE];

                    global.ctlist.push(ctTemp);
                    global.wasCtModified = true;
                    
                    PopulateList(false);
                }
            });
            return;
        }
    }
    
    global.intentctdetails[0] = 'ctid=' + ctid;
    global.intentctdetails[1] = 'frompage=ctlist';
    j$.mobile.changePage("#page_contactdetails", { transition: "none", role: "page" });    
    
    } catch(err) { common.PutToDebugLogException(2, "_contactslist: OnListItemClick", err); }
}

function OnListItemLongClick (id) // :no return value
{
    try{
        
    if (common.isNull(id) || id.length < 1)
    {
        common.PutToDebugLog(2, 'ERROR, _contactslist OnListItemLongClick id is NULL');
        return;
    }
    
    var ctid = '';
    var pos = id.indexOf('_');
    if (pos < 2)
    {
        common.PutToDebugLog(2, 'ERROR, _contactslist OnListItemLongClick invalid id 1');
        return;
    }
    
    ctid = common.Trim(id.substring(pos + 1));
    if (common.isNull(ctid) || ctid.length < 1 || !common.IsNumber(ctid))
    {
        common.PutToDebugLog(2, 'ERROR, _contactslist OnListItemLongClick invalid id 2: ' + ctid);
        return;
    }
    
//--     the ctid is from ctlistLocal, so we have to find the id from global.ctlist
    var globalid = '';
    var name = ctlistLocal[ctid][common.CT_NAME];
    for (var i = 0; i < global.ctlist.length; i++)
    {
        if (global.ctlist[i][common.CT_NAME] === name)
        {
            globalid = i.toString();
            break;
        }
    }
    
    CreateContextmenu(globalid);
    
    } catch(err) { common.PutToDebugLogException(2, "_contactslist: OnListItemLongClick", err); }
}

function CreateContextmenu(ctid, popupafterclose)
{
    try{
    var ctentry = ctlistLocal[ctid];
    if (common.isNull(ctid) || ctid.length < 1 || !common.IsNumber(ctid))
    {
        common.PutToDebugLog(2, 'ERROR, _contactslist: CreateContextmenu invalid contact id: ' + ctid);
    }

    var popupWidth = common.GetDeviceWidth();
    if ( !common.isNull(popupWidth) && common.IsNumber(popupWidth) && popupWidth > 100 )
    {
        popupWidth = Math.floor(popupWidth / 1.2);
    }else
    {
        popupWidth = 220;
    }
    
    var isfavorite = common.ContactIsFavorite(ctid);
    
    var list = '';
    var item = '<li id="[ITEMID]"><a data-rel="back">[ITEMTITLE]</a></li>';
    
    var itemTemp = '';
    
    itemTemp = item.replace('[ITEMID]', '#ct_item_edit_contact');
    itemTemp = itemTemp.replace('[ITEMTITLE]', stringres.get('menu_editcontact'));
    list = list + itemTemp;
    itemTemp = '';
    
    itemTemp = item.replace('[ITEMID]', '#ct_item_delete_contact');
    itemTemp = itemTemp.replace('[ITEMTITLE]', stringres.get('menu_deletecontact'));
    list = list + itemTemp;
    itemTemp = '';

// --------------------------

    itemTemp = item.replace('[ITEMID]', '#ct_item_call');
    itemTemp = itemTemp.replace('[ITEMTITLE]', stringres.get('menu_call'));
    list = list + itemTemp;
    itemTemp = '';

    if (common.CanIUseVideo() === true)
    {
        itemTemp = item.replace('[ITEMID]', '#ct_item_video_call');
        itemTemp = itemTemp.replace('[ITEMTITLE]', stringres.get('btn_videocall'));
        list = list + itemTemp;
        itemTemp = '';
    }

    itemTemp = item.replace('[ITEMID]', '#ct_item_message');
    itemTemp = itemTemp.replace('[ITEMTITLE]', stringres.get('send_msg'));
    list = list + itemTemp;
    itemTemp = '';
    
    if (common.GetConfigBool('hasfiletransfer', true) !== false && (common.GetConfigBool('usingmizuserver', false) === true || common.IsMizuWebRTCGateway() === true))
    {
        if (common.Glft() === true)
        {
            itemTemp = item.replace('[ITEMID]', '#ct_item_filetransf');
            itemTemp = itemTemp.replace('[ITEMTITLE]', stringres.get('filetransf_title'));
            list = list + itemTemp;
            itemTemp = '';
        }
    }
    
    var favtitle = stringres.get('menu_ct_setfavorite');
    if (isfavorite === true) { favtitle = stringres.get('menu_ct_unsetfavorite'); }
    itemTemp = item.replace('[ITEMID]', '#ct_item_favorite');
    itemTemp = itemTemp.replace('[ITEMTITLE]', favtitle);
    list = list + itemTemp;
    itemTemp = '';

    
    var template = '' +
'<div id="ct_contextmenu" data-role="popup" class="ui-content messagePopup" data-overlay-theme="a" data-theme="a" style="max-width:' + popupWidth + 'px; min-width: ' + Math.floor(popupWidth * 0.6) + 'px;">' +

    '<div data-role="header" data-theme="b">' +
        '<a href="javascript:;" data-role="button" data-icon="delete" data-iconpos="notext" class="ui-btn-right closePopup">Close</a>' +
        '<h1 class="adialog_title">' + ctentry[common.CT_NAME] + '</h1>' +
    '</div>' +
    '<div role="main" class="ui-content adialog_content" style="padding: 0; margin: 0;">' +
    
        '<ul id="ct_contextmenu_ul" data-role="listview" data-inset="true" data-icon="false" style="margin: 0;">' +
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
            
            j$('#ct_contextmenu_ul').off('click', 'li');
            
            popupafterclose();
        }
    });
    
   
        
    j$('#ct_contextmenu_ul').on('click', 'li', function(event)
    {
        var itemid = j$(this).attr('id');

        j$( '#ct_contextmenu' ).on( 'popupafterclose', function( event )
        {
            j$( '#ct_contextmenu' ).off( 'popupafterclose' );

            if (itemid === '#ct_item_edit_contact')
            {        
                EditContact(ctid);
            }
            else if (itemid === '#ct_item_delete_contact')
            {
                DeleteContact(ctid);
            }
            else if (itemid === '#ct_item_call')
            {
                InitiateCall(ctid, false);
            }
            else if (itemid === '#ct_item_video_call')
            {
                InitiateCall(ctid, true);
            }
            else if (itemid === '#ct_item_message')
            {
                SendMessage(ctid);
            }
            else if (itemid === '#ct_item_filetransf')
            {
                FileTrasnf(ctid);
            }
            else if (itemid === '#ct_item_favorite')
            {
                if (isfavorite === true)
                {
                    common.ContactSetFavorite(ctid, false);
                    common.ShowToast(stringres.get('ct_unsetfavorited'), 1400);
                }else
                {
                    common.ContactSetFavorite(ctid, true);
                    common.ShowToast(stringres.get('menu_ct_setfavorite'), 1400);
                }
            }
        });
    });
    } catch(err) { common.PutToDebugLogException(2, "_contactslist: CreateContextmenu", err); }
}

function FileTrasnf(ctidstr) // opens page message with the contact's number
{
    try{
    common.PutToDebugLog(2, 'EVENT, _contactslist: FileTrasnf contact id: ' + ctidstr);
    var ctid = common.StrToInt(ctidstr);
    var contact = global.ctlist[ctid];
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
    } catch(err) { common.PutToDebugLogException(2, "_contactslist: FileTrasnf", err); }
}

function InitiateCall(ctidstr, isvideo) // opens page message with the contact's number
{
    try{
    common.PutToDebugLog(2, 'EVENT, _contactslist: InitiateCall contact id: ' + ctidstr);
    var ctid = common.StrToInt(ctidstr);
    var contact = global.ctlist[ctid];
    var numbers = contact[common.CT_NUMBER];
    
    if (common.isNull(numbers) || numbers.length < 1)
    {
        common.PutToDebugLog(1, 'ERROR,' + stringres.get('ct_menu_error'));
        common.ShowToast('ERROR,' + stringres.get('ct_menu_error'));
        return;
    }
    
    if (numbers.length === 1)
    {
        var number = common.NormalizeNumber(numbers[0]);
        if (isvideo === true)
        {
            common.PutToDebugLog(4, 'EVENT, _contactslist initiate video call to: ' + number);
            webphone_api.videocall(number);
        }else
        {
            common.PutToDebugLog(4, 'EVENT, _contactslist initiate call to: ' + number);
            webphone_api.call(number, -1);
        }
        return;
    }else
    {
        common.PickContactNumber(ctid, function(pick_nr, pick_name)
        {
            var number = common.NormalizeNumber(pick_nr);
            if (isvideo === true)
            {
                common.PutToDebugLog(4, 'EVENT, _contactslist initiate video call to: ' + number);
                webphone_api.videocall(number);
            }else
            {
                common.PutToDebugLog(4, 'EVENT, _contactslist initiate call to: ' + number);
                webphone_api.call(number, -1);
            }
        });
        return;
    }
    } catch(err) { common.PutToDebugLogException(2, "_contactslist: InitiateCall", err); }
}

function SendMessage(ctidstr) // opens page message with the contact's number
{
    try{
    common.PutToDebugLog(2, 'EVENT, _contactslist: SendMessage contact id: ' + ctidstr);
    var ctid = common.StrToInt(ctidstr);
    var contact = global.ctlist[ctid];
    var numbers = contact[common.CT_NUMBER];
    
    if (common.isNull(numbers) || numbers.length < 1)
    {
        common.PutToDebugLog(1, 'ERROR,' + stringres.get('ct_menu_error'));
        common.ShowToast('ERROR,' + stringres.get('ct_menu_error'));
        return;
    }
    
// if we have only one number, then open message container, else popup fo user to choose
    if (numbers.length === 1)
    {
        common.StartMsg(numbers[0], '', '_contactslist');
        return;
    }else
    {
        common.PickContactNumber(ctid, function(pick_nr, pick_name)
        {
            common.StartMsg(pick_nr, '', '_contactslist');
        });
        return;
    }
    } catch(err) { common.PutToDebugLogException(2, "_contactslist: SendMessage", err); }
}

function DeleteContact(ctid, popupafterclose)
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
'<div id="ct_delete_contact_popup" data-role="popup" class="ui-content messagePopup" data-overlay-theme="a" data-theme="a" style="max-width:' + popupWidth + 'px;">' +

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
        global.ctlist.splice(ctid, 1);
        common.SaveContactsFile(function (issaved) { common.PutToDebugLog(4, 'EVENT, _contactslist: DeleteContact SaveContactsFile: ' + issaved.toString()); });

        PopulateList(false);
    });
    
//--    global.ctlist.splice(ctid, 1);
//--    common.SaveContactsFile(function (issaved) { common.PutToDebugLog(4, 'EVENT, _contactdetails: DeleteContact SaveContactsFile: ' + issaved.toString()); });
    
//--    j$.mobile.back();
        
    } catch(err) { common.PutToDebugLogException(2, "_contactdetails: DeleteContact", err); }
}

function EditContact(ctid) // open AddEditContact activity
{
    try{
    global.intentaddeditct[0] = 'action=edit';
    global.intentaddeditct[1] = 'ctid=' + ctid;

    j$.mobile.changePage("#page_addeditcontact", { transition: "pop", role: "page" });
    } catch(err) { common.PutToDebugLogException(2, "_contactslist: EditContact", err); }
}

var MENUITEM_CONTACTSLIST_SETTINGS = '#menuitem_contactslist_settings';
var MENUITEM_HELP = '#menuitem_contactslist_help';
var MENUITEM_CONTACTSLIST_NEWCT = '#menuitem_contactslist_newcontact';
var MENUITEM_EXIT = '#menuitem_contactslist_exit';
var MENUITEM_SYNC = '#menuitem_contactslist_sync';

function CreateOptionsMenu (menuId) // adding items to menu, called from html
{
    try{
// remove data transition for windows softphone, because it's slow
    if (common.IsWindowsSoftphone())
    {
        j$( "#btn_contactslist_menu" ).removeAttr('data-transition');
    }

    if ( common.isNull(menuId) || menuId.lenght < 1 ) { common.PutToDebugLog(2, "ERROR, _contactslist: CreateOptionsMenu menuid null"); return; }

    if (j$(menuId).length <= 0) { common.PutToDebugLog(2, "ERROR, _contactslist: CreateOptionsMenu can't get reference to Menu"); return; }
    
    if (menuId.charAt(0) !== '#') { menuId = '#' + menuId; }
    
    j$(menuId).html('');
    var featureset = common.GetParameterInt('featureset', 10);

    j$(menuId).append( '<li id="' + MENUITEM_CONTACTSLIST_NEWCT + '"><a data-rel="back">' + stringres.get('menu_new_contact') + '</a></li>' ).listview('refresh');
    
    if (common.IsWindowsSoftphone() === true)
    {
        if (featureset > 0)
        {
        // opens import dialog with more options
            j$(menuId).append( '<li id="' + MENUITEM_SYNC + '"><a data-rel="back">' + stringres.get('menu_import_list') + '...</a></li>' ).listview('refresh');
        }
    }else
    {
        if (featureset > 0 && (common.GetParameterInt('showsynccontactsmenu', 0) === 0 || common.GetParameterInt('showsynccontactsmenu', 0) === 1))
        {
            j$(menuId).append( '<li id="' + MENUITEM_SYNC + '"><a data-rel="back">' + stringres.get('menu_sync') + '</a></li>' ).listview('refresh');
        }
    }
    
    j$(menuId).append( '<li id="' + MENUITEM_CONTACTSLIST_SETTINGS + '"><a data-rel="back">' + stringres.get('settings_title') + '</a></li>' ).listview('refresh');
    
    var help_title = stringres.get('menu_help') + '...';
    if (common.GetConfigInt('brandid', -1) === 60) { help_title = stringres.get('help_about'); } // 101VOICEDT500
    j$(menuId).append( '<li id="' + MENUITEM_HELP + '"><a data-rel="back">' + help_title + '</a></li>' ).listview('refresh');
    
    if (common.IsWindowsSoftphone())
    {
        j$(menuId).append( '<li id="' + MENUITEM_EXIT + '"><a data-rel="back">' + stringres.get('menu_exit') + '</a></li>' ).listview('refresh');
    }

    return true;
    
    } catch(err) { common.PutToDebugLogException(2, "_contactslist: CreateOptionsMenu", err); }
    
    return false;
}

function MenuItemSelected(itemid)
{
    try{
    if (common.isNull(itemid) || itemid.length < 1) { return; }
    
    j$( '#contactslist_menu' ).on( 'popupafterclose', function( event )
    {
        j$( '#contactslist_menu' ).off( 'popupafterclose' );
        
        switch (itemid)
        {
            case MENUITEM_CONTACTSLIST_NEWCT:
                NewContact();
                break;
            case MENUITEM_CONTACTSLIST_SETTINGS:
                common.OpenSettings(true);
                break;
            case MENUITEM_HELP:
                setTimeout( function () { common.HelpWindow('settings'); }, 300);
                break;
            case MENUITEM_EXIT:
                common.Exit();
                break;
            case MENUITEM_SYNC:
                if (common.IsWindowsSoftphone() === true)
                {
                    ImportContactsPopup();
                }else
                {   
                    common.DownloadContacts();
                }
                break;
        }
    });
    } catch(err) { common.PutToDebugLogException(2, "_contactslist: MenuItemSelected", err); }
}

function ImportContactsPopup(popupafterclose)
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
    var item = '<li id="[ITEMID]"><a data-rel="back">[ITEMTITLE]</a></li>';

    var itemTemp = '';

    itemTemp = item.replace('[ITEMID]', '#item_import_file');
    itemTemp = itemTemp.replace('[ITEMTITLE]', stringres.get('menu_import_file'));
    list = list + itemTemp;
    itemTemp = '';
    itemTemp = item.replace('[ITEMID]', '#item_import_outlook');
    itemTemp = itemTemp.replace('[ITEMTITLE]', stringres.get('menu_import_outlook'));
    list = list + itemTemp;
    itemTemp = '';
    itemTemp = item.replace('[ITEMID]', '#item_import_skype');
    itemTemp = itemTemp.replace('[ITEMTITLE]', stringres.get('menu_import_skype'));
    list = list + itemTemp;
    itemTemp = '';
    itemTemp = item.replace('[ITEMID]', '#item_import_google');
    itemTemp = itemTemp.replace('[ITEMTITLE]', stringres.get('menu_import_google'));
    list = list + itemTemp;
    itemTemp = '';
    itemTemp = item.replace('[ITEMID]', '#item_import_android');
    itemTemp = itemTemp.replace('[ITEMTITLE]', stringres.get('menu_import_android'));
    list = list + itemTemp;
    itemTemp = '';
    itemTemp = item.replace('[ITEMID]', '#item_export_file');
    itemTemp = itemTemp.replace('[ITEMTITLE]', stringres.get('menu_export_file'));
    list = list + itemTemp;
    itemTemp = '';


    var template = '' +
'<div id="import_contacts_window" data-role="popup" class="ui-content messagePopup" data-overlay-theme="a" data-theme="a" style="max-width:' + popupWidth + 'px; min-width: ' + Math.floor(popupWidth * 0.6) + 'px;">' +

    '<div data-role="header" data-theme="b">' +
        '<a href="javascript:;" data-role="button" data-icon="delete" data-iconpos="notext" class="ui-btn-right closePopup">Close</a>' +
        '<h1 class="adialog_title">' + stringres.get('menu_import_list') + '</h1>' +
    '</div>' +
    '<div role="main" class="ui-content adialog_content" style="padding: 0; margin: 0;">' +

        '<ul id="import_contacts_window_ul" data-role="listview" data-inset="true" data-icon="false" style="margin: 0;">' +
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

            j$('#import_contacts_window_ul').off('click', 'li');

            popupafterclose();
        }
    });

    j$('#import_contacts_window_ul').on('click', 'li', function(event)
    {
        var itemid = j$(this).attr('id');

        j$( '#import_contacts_window' ).on( 'popupafterclose', function( event )
        {
            j$( '#import_contacts_window' ).off( 'popupafterclose' );

            ImportContacts(itemid);
        });
    });
    } catch(err) { common.PutToDebugLogException(2, "_contactslist: ImportContactsPopup", err); }
}

function ImportContacts(id)
{
    try{
    if (common.isNull(id) || id.length < 3)
    {
        common.PutToDebugLog(2, 'ERROR, _contactslist ImportContacts invalid entry: ' + id);
        return;
    }
    common.PutToDebugLog(2, 'EVENT, USER ImportContacts: ' + id);
    /*
                        Import from File (Restore)  -> extcmd_import_file           Comment/Hint: Load from CSV file
                        Import from Outlook -> extcmd_import_outlook             Comment/Hint: 
                        Import from Skype -> extcmd_import_skype     Comment/Hint: 
                        Import from Google -> extcmd_import_google Comment/Hint: 
                        Import from Android phone  (already exists)      Comment/Hint: 
                        Export to File (Backup) -> extcmd_export_file   Comment/Hint: Save to CSV file
*/
    if (id === '#item_import_android')
    {
        common.DownloadContacts();
    }
    else if (id === '#item_import_file') // file import
    {
        var url = common.AddJscommport(global.WIN_SOFTPHONE_URL) + '?extcmd_import_file';
        common.WinSoftphoneHttpReq(url, 'GET', '', function (resp)
        {
            common.PutToDebugLog(2, 'EVENT, Import contacts from file: ' + resp);
        });
    }
    else if (id === '#item_export_file') // file export
    {
        var url = common.AddJscommport(global.WIN_SOFTPHONE_URL) + '?extcmd_export_file';
        common.WinSoftphoneHttpReq(url, 'GET', '', function (resp)
        {
            common.PutToDebugLog(2, 'EVENT, Export contacts to file: ' + resp);
        });
    }
    else if (id === '#item_import_outlook') // outlook import
    {
        var url = common.AddJscommport(global.WIN_SOFTPHONE_URL) + '?extcmd_import_outlook';
        common.WinSoftphoneHttpReq(url, 'GET', '', function (resp)
        {
            common.PutToDebugLog(2, 'EVENT, Import contacts from outlook: ' + resp);
        });
    }
    else if (id === '#item_import_skype') // skype import
    {
        var url = common.AddJscommport(global.WIN_SOFTPHONE_URL) + '?extcmd_import_skype';
        common.WinSoftphoneHttpReq(url, 'GET', '', function (resp)
        {
            common.PutToDebugLog(2, 'EVENT, Import contacts from skype: ' + resp);
        });
    }
    else if (id === '#item_import_skype') // google import
    {
        var url = common.AddJscommport(global.WIN_SOFTPHONE_URL) + '?extcmd_import_google';
        common.WinSoftphoneHttpReq(url, 'GET', '', function (resp)
        {
            common.PutToDebugLog(2, 'EVENT, Import contacts from google: ' + resp);
        });
    }
    } catch(err) { common.PutToDebugLogException(2, "_contactslist: ImportContacts", err); }
}

function NewContact() // open AddEditContact activity
{
    try{
    global.intentaddeditct = [];
    global.intentaddeditct[0] = 'action=add';
    
    j$.mobile.changePage("#page_addeditcontact", { transition: "pop", role: "page" });

    } catch(err) { common.PutToDebugLogException(2, "_contactslist: NewContact", err); }
}

function onStop(event)
{
    try{
    common.PutToDebugLog(4, "EVENT, _contactslist: onStop");
    global.isContactslistStarted = false;
    
    // reset toogle contact to default value
    j$('select#togglecontact').val('no').flipswitch('refresh');
    
    common.SaveContactsFile(function (issaved) { common.PutToDebugLog(4, 'EVENT, _contactslist: onDestroy SaveContactsFile: ' + issaved.toString()); });

    } catch(err) { common.PutToDebugLogException(2, "_contactslist: onStop", err); }
}

function onDestroy (event){} // deprecated by onstop
var contactslist_public = {

    PopulateList: PopulateList,
    MeasureContacslist: MeasureContacslist
};
window.contactslist_public = contactslist_public;

// public members and methods
return {
    onCreate: onCreate,
    onStart: onStart,
    onStop: onStop,
    onDestroy: onDestroy
};
})();