// AddEditContact page
//--define(['jquery', 'common', 'stringres', 'global'], function($, common, stringres, global)
wpa._addeditcontact = (function ()
{
var action = '';
var numberToAdd = '';
var nameToAdd = '';
var ctid = -1;
var name = '';
var nameField = null;
var contact = null;
var numbers = null;
var types = null;

function onCreate (event) // called only once - bind events here
{
    try{
    common.PutToDebugLog(4, "EVENT, _addeditcontact: onCreate");
    
    j$( window ).resize(function() // window resize handling
    {
        if (j$.mobile.activePage.attr('id') === 'page_addeditcontact')
        {
            MeasureAddeditcontact();
        }
    });
    
    j$('#addeditcontact_menu_ul').on('click', 'li', function(event)
    {
        MenuItemSelected(j$(this).attr('id'));
    });
    j$("#btn_addeditcontact_menu").on("click", function() { CreateOptionsMenu('#addeditcontact_menu_ul'); });
    j$("#btn_addeditcontact_menu").attr("title", stringres.get("hint_menu"));
    
    j$("#btn_save_aec").on("click", function() { SaveContact(); });
    j$("#btn_revert_aec").on("click", function() { j$.mobile.back(); });
    
    j$("#btn_add_aec").on("click", function() { AddPhoneField(null, null, true); });
    j$("#btn_add_aec").attr("title", stringres.get("hint_addphone"));
    j$(".minus_btn").attr("title", stringres.get("hint_removephone"));
    
    j$("#btn_add_aec_details").on("click", function() { AddDetailsField(); });
    j$("#btn_add_aec_details").attr("title", stringres.get("addeditct_hint_adddetails"));
    
    var fieldcount = j$('#aec_number_fields').children().length;
    if (!common.isNull(fieldcount) && fieldcount > 0)
    {
        for (var i = 0; i < fieldcount; i++)
        {
            (function (i)
            {
                j$('#btn_type_aec_' + i).on('click', function() { ChooseType(i, j$(this).html()); });
                j$('#btn_minus_aec_' + i).on('click', function() { RemoveEntry(i); });
            }(i));
        }
    }
    
    } catch(err) { common.PutToDebugLogException(2, "_addeditcontact: onCreate", err); }
}

function onStart(event)
{
    try{
    common.PutToDebugLog(4, "EVENT, _addeditcontact: onStart");
    global.isAddeditcontactStarted = true;
    
//--    j$("#phone_number").attr("placeholder", stringres.get("phone_nr"));
//--    document.getElementById("app_name_addeditcontact").innerHTML = common.GetBrandName();
    document.getElementById('aec_label_name').innerHTML = stringres.get('contact_name');
    j$('#aec_name').attr('placeholder', stringres.get('contact_name'));
    j$('#aec_lastname').attr('placeholder', stringres.get('contact_lastname'));
    document.getElementById('aec_label_phone').innerHTML = stringres.get('contact_phone');
    document.getElementById('btn_save_aec').innerHTML = stringres.get('btn_save');
    document.getElementById('btn_revert_aec').innerHTML = stringres.get('btn_cancel');
    
    j$("#addeditcontact_list").attr("data-filter-placeholder", stringres.get("ct_search_hint"));
    
    j$(".separator_line_thick").css( 'background-color', common.HoverCalc(common.getBgColor('#page_addeditcontact'), -30) );
    
    if (!common.isNull(document.getElementById('addeditct_btnback')))
    {
        document.getElementById('addeditct_btnback').innerHTML = '<b>&LT;</b>&nbsp;' + stringres.get('btn_cancel');
    }
    
    j$('#aec_label_details').html(stringres.get('addeditct_addfield'));
    j$('#aec_entry_email label').html(stringres.get('addeditct_label_email') + ':');
    j$('#aec_entry_address label').html(stringres.get('addeditct_label_address') + ':');
    j$('#aec_entry_notes label').html(stringres.get('addeditct_label_notes') + ':');
    j$('#aec_entry_website label').html(stringres.get('addeditct_label_website') + ':');
    
// needed for proper display and scrolling of listview
    MeasureAddeditcontact();
    setTimeout(function () { MeasureAddeditcontact(); }, 1000);
    
    action = common.GetIntentParam(global.intentaddeditct, 'action');
    
    if (!common.isNull(action) && action.length > 0)
    {
        if (action === 'add')
        {
            numberToAdd = common.GetIntentParam(global.intentaddeditct, 'numbertoadd');
            nameToAdd = common.GetIntentParam(global.intentaddeditct, 'nametoadd');
            if (common.isNull(nameToAdd)) { nameToAdd = ''; }
            
            document.getElementById('addeditct_title').innerHTML = stringres.get('addeditct_title_new');
        }else if (action === 'edit')
        {
            try{
                ctid = common.StrToInt(common.GetIntentParam(global.intentaddeditct, 'ctid'));
            } catch(errin) { common.PutToDebugLogException(2, "_addeditcontact: onStart can't convert contact id", errin); }
    
            contact = global.ctlist[ctid];
            numbers = contact[common.CT_NUMBER];
            types = contact[common.CT_PTYPE];
            
            document.getElementById('addeditct_title').innerHTML = stringres.get('addeditct_title_edit');
        }else
        {
            j$.mobile.back();
        }
    }
    
    j$("#addeditct_title").attr("title", stringres.get("hint_page"));
    
    if (!common.isNull(contact) && contact.length > 0) { name = contact[common.CT_NAME]; }
        
    nameField = document.getElementById('aec_name');
    
    if (action === 'add' && !common.isNull(nameField))
    {
        nameField.focus(); // setting cursor to text input
    }
    
    PopulateData();
    
    } catch(err) { common.PutToDebugLogException(2, "_addeditcontact: onStart", err); }
}

function MeasureAddeditcontact() // resolve window height size change
{
    try{
    j$('#page_addeditcontact').css('min-height', 'auto'); // must be set when softphone is skin in div

    var heightTemp = common.GetDeviceHeight() - j$("#addeditcontact_header").height() - j$('#aec_footer').height();
    heightTemp = heightTemp - 5;
    j$("#page_addeditcontact_content").height(heightTemp);
    
    } catch(err) { common.PutToDebugLogException(2, "_addeditcontact: MeasureAddeditcontact", err); }
}

function PopulateData()
{
   try{ 
    if (action === 'add')
    {
        if (nameToAdd.length > 0) { nameField.value = nameToAdd; }
        
        if (!common.isNull(numberToAdd) && numberToAdd.length > 0)
        {
            AddPhoneField('', common.Trim(numberToAdd), false);
        }else
        {
            AddPhoneField('', '', false);
        }
    }else if (action === 'edit')
    {
        nameField.value = common.Trim(name);
        
        if (ctid < 0)
        {
            common.PutToDebugLog(2, 'ERROR, _addeditcontact PopulateData incorrect ctid');
            return;
        }
        
        if (common.isNull(numbers) || numbers.length < 1)
        {
            return;
        }
        var availableLayouts = j$('#aec_number_fields').children().length;

        for (var i = 0; i < numbers.length; i++)
        {
            if (i >= availableLayouts) { break; }
            
            var typetmp = '';
            if (!common.isNull(types[i])) typetmp = types[i];
            
            AddPhoneField(typetmp, numbers[i], false);
        }
        
        var ctemail = contact[common.CT_EMAIL];
        var ctaddress = contact[common.CT_ADDRESS];
        var ctnotes = contact[common.CT_NOTES];
        var ctwebsite = contact[common.CT_WEBSITE];
        
        if (!common.isNull(ctemail) && common.Trim(ctemail).length > 0) { j$('#number_aec_email').val(ctemail); j$('#aec_entry_email').show(); }
        if (!common.isNull(ctaddress) && common.Trim(ctaddress).length > 0) { j$('#number_aec_address').val(ctaddress); j$('#aec_entry_address').show(); }
        if (!common.isNull(ctnotes) && common.Trim(ctnotes).length > 0) { j$('#number_aec_notes').val(ctnotes); j$('#aec_entry_notes').show(); }
        if (!common.isNull(ctwebsite) && common.Trim(ctwebsite).length > 0) { j$('#number_aec_website').val(ctwebsite); j$('#aec_entry_website').show(); }
    }
    
    //hide add field button, if all possible fields are already added
    //email, address, notes, website
    if (j$('#aec_entry_email').is(':visible') && j$('#aec_entry_address').is(':visible') && j$('#aec_entry_notes').is(':visible') && j$('#aec_entry_website').is(':visible'))
    {
        j$('#aec_add_deatils').hide();
    }
    
    } catch(err) { common.PutToDebugLogException(2, "_addeditcontact: PopulateData", err); }
}

function AddPhoneField(type, number, isonclick)
{
    try{
    if (isonclick)
    {
        common.PutToDebugLog(5, 'EVENT, _addeditcontact: AddPhoneField on click');
    }
    // default value
    if (common.isNull(type) || type.length < 3) { type = 'phone'; }
    if (common.isNull(number)) { number = ''; }
    var fieldcount = j$('#aec_number_fields').children().length;
    
    var elements = j$('#aec_number_fields').children();
    if (common.isNull(fieldcount) || fieldcount < 1) { return; }
    
    for (var i = 0; i < fieldcount; i++)
    {
        var newelement = document.getElementById('aec_entry_' + i);
                
        if ( !common.isNull(newelement) && newelement.style.display === 'none')
        {
            newelement.style.display = 'block';
            j$('#btn_type_aec_' + i).html(stringres.get(type));
            j$('#number_aec_' + i).val(number);
            if (isonclick) { j$('#btn_type_aec_' + i).click(); } // display choose type if new field added
            break;
        }
    }
  /*
    var template = 
        '<div id="aec_entry_' + fieldcount + '" class="aec_numbers">' +
            '<button id="btn_type_aec_' + fieldcount + '" class="aec_phonetype ui-btn-inline ui-btn ui-btn-corner-all ui-btn-b noshadow">' +  stringres.get(type)+ '</button>' +
            '<input type="text" value="' + number + '" id="number_aec_' + fieldcount + '" name="number" data-theme="a"/>' +
            '<div id="btn_minus_aec_' + fieldcount + '" class="minus_btn"><button class="aec_remove noshadow ui-btn-inline ui-btn ui-btn-corner-all ui-btn-b ui-icon-minus ui-btn-icon-notext">Remove</button></div>' +
        '</div>';

    j$('#aec_number_fields').append(template).trigger('create');*/
    
    } catch(err) { common.PutToDebugLogException(2, "_addeditcontact: AddPhoneField", err); }
}

function AddDetailsField(popupafterclose)
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
    //email, address, notes, website
    var i_email = '<li id="#addfield_item_email"><a data-rel="back">' + stringres.get('addeditct_label_email') + '</a></li>';
    var i_address = '<li id="#addfield_item_address"><a data-rel="back">' + stringres.get('addeditct_label_address') + '</a></li>';
    var i_notes = '<li id="#addfield_item_notes"><a data-rel="back">' + stringres.get('addeditct_label_notes') + '</a></li>';
    var i_website = '<li id="#addfield_item_website"><a data-rel="back">' + stringres.get('addeditct_label_website') + '</a></li>';
    
    if (!j$('#aec_entry_email').is(':visible')) { list = list + i_email; }
    if (!j$('#aec_entry_address').is(':visible')) { list = list + i_address; }
    if (!j$('#aec_entry_notes').is(':visible')) { list = list + i_notes; }
    if (!j$('#aec_entry_website').is(':visible')) { list = list + i_website; }
    
    var template = '' +
'<div id="addfieldpopup" data-role="popup" class="ui-content messagePopup" data-overlay-theme="a" data-theme="a" style="max-width:' + popupWidth + 'px; min-width: ' + Math.floor(popupWidth * 0.6) + 'px;">' +

    '<div data-role="header" data-theme="b">' +
        '<a href="javascript:;" data-role="button" data-icon="delete" data-iconpos="notext" class="ui-btn-right closePopup">Close</a>' +
        '<h1 class="adialog_title">' + stringres.get('addeditct_hint_adddetails') + '</h1>' +
    '</div>' +
    '<div role="main" class="ui-content adialog_content" style="padding: 0; margin: 0;">' +
        '<ul id="addfieldpopup_ul" data-role="listview" data-inset="true" data-icon="false" style="margin: 0;">' +
            list +
        '</ul>' +
//        '<a href="javascript:;" class="ui-btn ui-corner-all ui-shadow ui-btn-inline ui-btn-b" data-rel="back">' + stringres.get('btn_close') + '</a>' +
//        '<a href="javascript:;" class="ui-btn ui-corner-all ui-shadow ui-btn-inline ui-btn-b" data-rel="back" data-transition="flow">Delete</a>' +
    '</div>' +
//    '<div data-role="footer" data-theme="b" class="adialog_footer">' +
//        '<a href="javascript:;" style="width: 98%;" class="ui-btn ui-corner-all ui-shadow ui-btn-inline ui-btn-b adialog_2button" data-rel="back" data-transition="flow">' + stringres.get('btn_close') + '</a>' +
//    '</div>' +
'</div>';
 
    popupafterclose = popupafterclose ? popupafterclose : function () {};

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
            
            j$('#addfieldpopup_ul').off('click', 'li');
            
            popupafterclose();
        }
    });
    
   
    j$('#addfieldpopup_ul').on('click', 'li', function(event)
    {
        var itemid = j$(this).attr('id');

        j$( '#addfieldpopup' ).on( 'popupafterclose', function( event )
        {
            if (itemid === '#addfield_item_email') { j$('#aec_entry_email').show(); }
            if (itemid === '#addfield_item_address') { j$('#aec_entry_address').show(); }
            if (itemid === '#addfield_item_notes') { j$('#aec_entry_notes').show(); }
            if (itemid === '#addfield_item_website') { j$('#aec_entry_website').show(); }
            
        //hide add field button, if all possible fields are already added
            //email, address, notes, website
            if (j$('#aec_entry_email').is(':visible') && j$('#aec_entry_address').is(':visible') && j$('#aec_entry_notes').is(':visible') && j$('#aec_entry_website').is(':visible'))
            {
                j$('#aec_add_deatils').hide();
            }
            
        });
    });
    
    } catch(err) { common.PutToDebugLogException(2, "_addeditcontact: AddDetailsField", err); }
}

function ChooseType (idnr, type, popupafterclose)
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
    
    var checked_phone = '';
    var checked_home = '';
    var checked_mobile = '';
    var checked_work = '';
    var checked_other = '';
    var checked_fax_home = '';
    var checked_fax_work = '';
    var checked_pager = '';
    var checked_sip = '';
    
    if (!common.isNull(type) && type.length > 0)
    {
        if (type === stringres.get('phone')) { checked_phone = 'checked="checked"'; }
        if (type === stringres.get('home')) { checked_home = 'checked="checked"'; }
        if (type === stringres.get('mobile')) { checked_mobile = 'checked="checked"'; }
        if (type === stringres.get('work')) { checked_work = 'checked="checked"'; }
        if (type === stringres.get('other')) { checked_other = 'checked="checked"'; }
        if (type === stringres.get('fax_home')) { checked_fax_home = 'checked="checked"'; }
        if (type === stringres.get('fax_work')) { checked_fax_work = 'checked="checked"'; }
        if (type === stringres.get('pager')) { checked_pager = 'checked="checked"'; }
        if (type === stringres.get('sip')) { checked_sip = 'checked="checked"'; }
    }else
    {
    // default value
        checked_phone = 'checked="checked"';
    }
    
    var radiob = '' +
        '<form>' +
        '<fieldset data-role="controlgroup">' +
            '<input name="phone_type" id="radio_phone" value="on" ' + checked_phone + ' type="radio">' +
            '<label for="radio_phone">' + stringres.get('phone') + '</label>' +
            '<input name="phone_type" id="radio_home" value="on" ' + checked_home + ' type="radio">' +
            '<label for="radio_home">' + stringres.get('home') + '</label>' +
            '<input name="phone_type" id="radio_mobile" value="on" ' + checked_mobile + ' type="radio">' +
            '<label for="radio_mobile">' + stringres.get('mobile') + '</label>' +
            '<input name="phone_type" id="radio_work" value="on" ' + checked_work + ' type="radio">' +
            '<label for="radio_work">' + stringres.get('work') + '</label>' +
            '<input name="phone_type" id="radio_other" value="on" ' + checked_other + ' type="radio">' +
            '<label for="radio_other">' + stringres.get('other') + '</label>' +
            '<input name="phone_type" id="radio_fax_home" value="on" ' + checked_fax_home + ' type="radio">' +
            '<label for="radio_fax_home">' + stringres.get('fax_home') + '</label>' +
            '<input name="phone_type" id="radio_fax_work" value="on" ' + checked_fax_work + ' type="radio">' +
            '<label for="radio_fax_work">' + stringres.get('fax_work') + '</label>' +
            '<input name="phone_type" id="radio_pager" value="on" ' + checked_pager + ' type="radio">' +
            '<label for="radio_pager">' + stringres.get('pager') + '</label>' +
            '<input name="phone_type" id="radio_sip" value="on" ' + checked_sip + ' type="radio">' +
            '<label for="radio_sip">' + stringres.get('sip') + '</label>' +
        '</fieldset>' +
        '</form>';
    
    var template = '' +
'<div data-role="popup" class="ui-content messagePopup" data-overlay-theme="a" data-theme="a" style="max-width:' + popupWidth + 'px; min-width: ' + Math.floor(popupWidth * 0.6) + 'px;">' +

    '<div data-role="header" data-theme="b">' +
        '<a href="javascript:;" data-role="button" data-icon="delete" data-iconpos="notext" class="ui-btn-right closePopup">Close</a>' +
        '<h1 class="adialog_title">' + stringres.get('contact_alert_title') + '</h1>' +
    '</div>' +
    '<div role="main" class="ui-content">' +
    radiob +
    '</div>' +
//    '<div data-role="footer" data-theme="b" class="adialog_footer">' +
//        '<a href="javascript:;" style="width: 98%;" class="ui-btn ui-corner-all ui-shadow ui-btn-inline ui-btn-b adialog_2button" data-rel="back" data-transition="flow">' + stringres.get('btn_close') + '</a>' +
//    '</div>' +
'</div>';
 
    popupafterclose = popupafterclose ? popupafterclose : function () {};

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
            popupafterclose();
        }
    });
    
    j$(":radio").on ("change", function (event)
    {
        j$.mobile.activePage.find(".messagePopup").popup("close");
        var newtype = j$(this).attr ("id");
        
        if (common.isNull(newtype) || newtype.length < 1) { return; }
        
        var pos = newtype.indexOf('_');
        if (pos > 0 && pos < newtype.length)
        {
            newtype = newtype.substring(pos + 1);
        }
//--        alert (j$(this).attr ("id"));
        j$('#btn_type_aec_' + idnr).html(stringres.get(newtype));
    });
        
    } catch(err) { common.PutToDebugLogException(2, "_addeditcontact: ChooseType", err); }
}

function RemoveEntry (idnr)
{
    try{
    var elem = document.getElementById('aec_entry_' + idnr);
    if (!common.isNull(elem))
    {
        elem.style.display = 'none';
    }
    } catch(err) { common.PutToDebugLogException(2, "_addeditcontact: RemoveEntry", err); }
}

function SaveContact()
{
    try{
    if (action === 'add')
    {
        SaveNewContact();
    }else if (action === 'edit')
    {
        SaveEditedContact();
    }else
    {
        return;
    }
    } catch(err) { common.PutToDebugLogException(2, "_addeditcontact: SaveContact", err); }
}

function SaveEditedContact()
{
    try{
    var currName = nameField.value;

    if (common.isNull(currName)) { currName = ''; }
    currName = common.Trim(currName);
    
    var fieldcount = j$('#aec_number_fields').children().length;
    
    if (common.isNull(fieldcount) || fieldcount < 1)
    {
        common.PutToDebugLog(2, 'ERROR, SaveEditedContact fieldcount is null');
        return;
    }
    
    var numbersTemp = [];
    var typesTemp = [];
    var idx = 0;
    
    for (var i = 0; i < fieldcount; i++)
    {
        var itemField = document.getElementById('aec_entry_' + i);
        var nrtemp = j$('#number_aec_' + i).val();
        var typefieldTemp = j$('#btn_type_aec_' + i).html();
        var tptemp = stringres.get('mobile');
        
        if (common.isNull(itemField) || itemField.style.display === 'none')
        {
            continue;
        }
        
        if ( common.isNull(nrtemp) || (common.Trim(nrtemp)).length < 1 )
        {
            continue;
        }
        
        if (typefieldTemp === stringres.get('phone'))       { tptemp = 'phone'; }
        if (typefieldTemp === stringres.get('home'))        { tptemp = 'home'; }
        if (typefieldTemp === stringres.get('mobile'))      { tptemp = 'mobile'; }
        if (typefieldTemp === stringres.get('work'))        { tptemp = 'work'; }
        if (typefieldTemp === stringres.get('other'))       { tptemp = 'other'; }
        if (typefieldTemp === stringres.get('fax_home'))    { tptemp = 'fax_home'; }
        if (typefieldTemp === stringres.get('fax_work'))    { tptemp = 'fax_work'; }
        if (typefieldTemp === stringres.get('pager'))       { tptemp = 'pager'; }
        if (typefieldTemp === stringres.get('sip'))         { tptemp = 'sip'; }
        
//--         ['Ambrus Akos', ['40724335358', '0268123456'], ['home', 'work'], '0', '13464346', '0', '0']
        numbersTemp[idx] = nrtemp;
        typesTemp[idx] = tptemp;
        idx ++;
    }
    
    if (common.isNull(numbersTemp) || numbersTemp.length < 1)
    {
        if (currName.length < 1)
        {
            common.ShowToast(stringres.get('contact_no_nunber'));
            return;
        }
        
//--      new contact-nal nem kell kerni szamot
//--             ranezni, hogy van-e benne space, s ha nincs akkor rakja be telefonszamnak
        if (currName.indexOf(' ') < 0)
        {
            var tmptype = 'phone';
            if (!common.IsNumber(currName)) { tmptype = 'sip'; }
            
            numbersTemp.push(currName);
            typesTemp.push(tmptype);
        }
    }
    
    if (currName.length < 1) { currName = numbersTemp[0]; }

    var modified = (common.GetTickCount()).toString();

    var ctemail = '';
    var ctaddress = '';
    var ctnotes = '';
    var ctwebsite = '';
    
    if (j$('#number_aec_email').is(':visible'))
    {
        ctemail = j$('#number_aec_email').val();
        if (common.isNull(ctemail)) { ctemail = ''; } else { ctemail = common.Trim(ctemail); }
    }
    if (j$('#number_aec_address').is(':visible'))
    {
        ctaddress = j$('#number_aec_address').val();
        if (common.isNull(ctaddress)) { ctaddress = ''; } else { ctaddress = common.Trim(ctaddress); }
        
        ctaddress = common.ReplaceAll(ctaddress, '\r\n', ' ');
        ctaddress = common.ReplaceAll(ctaddress, '\n', ' ');
        ctaddress = common.ReplaceAll(ctaddress, ',', ' ');
    }
    if (j$('#number_aec_notes').is(':visible'))
    {
        ctnotes = j$('#number_aec_notes').val();
        if (common.isNull(ctnotes)) { ctnotes = ''; } else { ctnotes = common.Trim(ctnotes); }
        
        ctnotes = common.ReplaceAll(ctnotes, '\r\n', ' ');
        ctnotes = common.ReplaceAll(ctnotes, '\n', ' ');
        ctnotes = common.ReplaceAll(ctnotes, ',', ' ');
    }
    if (j$('#number_aec_website').is(':visible'))
    {
        ctwebsite = j$('#number_aec_website').val();
        if (common.isNull(ctwebsite)) { ctwebsite = ''; } else { ctwebsite = common.Trim(ctwebsite); }
    }

    var ctTemp = [];
    ctTemp[common.CT_NAME] = currName;
    ctTemp[common.CT_NUMBER] = numbersTemp;
    ctTemp[common.CT_PTYPE] = typesTemp;
    ctTemp[common.CT_USAGE] = contact[common.CT_USAGE];
    ctTemp[common.CT_LASTMODIF] = modified;
    ctTemp[common.CT_DELFLAG] = contact[common.CT_DELFLAG];
    ctTemp[common.CT_FAV] = contact[common.CT_FAV];
    ctTemp[common.CT_EMAIL] = ctemail;
    ctTemp[common.CT_ADDRESS] = ctaddress;
    ctTemp[common.CT_NOTES] = ctnotes;
    ctTemp[common.CT_WEBSITE] = ctwebsite;
    
    global.ctlist[ctid] = ctTemp;
    global.wasCtModified = true;
    
    common.SortContacts();
    
    setTimeout(function ()
    {
        common.ShowToast(stringres.get('contact_saved'));
    }, 300);
    j$.mobile.back();
    return;
    
    } catch(err) { common.PutToDebugLogException(2, "_addeditcontact: SaveEditedContact", err); }
    try{ common.ShowToast(stringres.get('contact_save_error')); j$.mobile.back(); } catch(err) { ; }
}

function SaveNewContact()
{
    try{
    var currName = nameField.value;

    if (common.isNull(currName)) { currName = ''; }
    currName = common.Trim(currName);

    var fieldcount = j$('#aec_number_fields').children().length;
    
    if (common.isNull(fieldcount) || fieldcount < 1)
    {
        common.PutToDebugLog(2, 'ERROR, SaveNewContact fieldcount is null');
        return;
    }
    
    var numbersTemp = [];
    var typesTemp = [];
    var idx = 0;
    
    for (var i = 0; i < fieldcount; i++)
    {
        var nrtemp = j$('#number_aec_' + i).val();
        var typefieldTemp = j$('#btn_type_aec_' + i).html();
        var tptemp = stringres.get('mobile');
        
        if ( common.isNull(nrtemp) || (common.Trim(nrtemp)).length < 1 )
        {
            continue;
        }
        
        if (typefieldTemp === stringres.get('phone'))       { tptemp = 'phone'; }
        if (typefieldTemp === stringres.get('home'))        { tptemp = 'home'; }
        if (typefieldTemp === stringres.get('mobile'))      { tptemp = 'mobile'; }
        if (typefieldTemp === stringres.get('work'))        { tptemp = 'work'; }
        if (typefieldTemp === stringres.get('other'))       { tptemp = 'other'; }
        if (typefieldTemp === stringres.get('fax_home'))    { tptemp = 'fax_home'; }
        if (typefieldTemp === stringres.get('fax_work'))    { tptemp = 'fax_work'; }
        if (typefieldTemp === stringres.get('pager'))       { tptemp = 'pager'; }
        if (typefieldTemp === stringres.get('sip'))         { tptemp = 'sip'; }
        
//--         ['Ambrus Akos', ['40724335358', '0268123456'], ['home', 'work'], '0', '13464346', '0', '0']
        numbersTemp[idx] = nrtemp;
        typesTemp[idx] = tptemp;
        idx ++;
    }
    
    if (common.isNull(numbersTemp) || numbersTemp.length < 1)
    {
        if (currName.length < 1)
        {
            common.ShowToast(stringres.get('contact_no_nunber'));
            return;
        }
        
//--      new contact-nal nem kell kerni szamot
//--             ranezni, hogy van-e benne space, s ha nincs akkor rakja be telefonszamnak
        if (currName.indexOf(' ') < 0)
        {
            var tmptype = 'phone';
            if (!common.IsNumber(currName)) { tmptype = 'sip'; }
            
            numbersTemp.push(currName);
            typesTemp.push(tmptype);
        }
    }
    
    if (currName.length < 1) { currName = numbersTemp[0]; }

    var modified = (common.GetTickCount()).toString();
    
    var ctemail = '';
    var ctaddress = '';
    var ctnotes = '';
    var ctwebsite = '';
    
    if (j$('#number_aec_email').is(':visible'))
    {
        ctemail = j$('#number_aec_email').val();
        if (common.isNull(ctemail)) { ctemail = ''; } else { ctemail = common.Trim(ctemail); }
    }
    if (j$('#number_aec_address').is(':visible'))
    {
        ctaddress = j$('#number_aec_address').val();
        if (common.isNull(ctaddress)) { ctaddress = ''; } else { ctaddress = common.Trim(ctaddress); }
        
        ctaddress = common.ReplaceAll(ctaddress, '\r\n', ' ');
        ctaddress = common.ReplaceAll(ctaddress, '\n', ' ');
        ctaddress = common.ReplaceAll(ctaddress, ',', ' ');
    }
    if (j$('#number_aec_notes').is(':visible'))
    {
        ctnotes = j$('#number_aec_notes').val();
        if (common.isNull(ctnotes)) { ctnotes = ''; } else { ctnotes = common.Trim(ctnotes); }
        
        ctnotes = common.ReplaceAll(ctnotes, '\r\n', ' ');
        ctnotes = common.ReplaceAll(ctnotes, '\n', ' ');
        ctnotes = common.ReplaceAll(ctnotes, ',', ' ');
    }
    if (j$('#number_aec_website').is(':visible'))
    {
        ctwebsite = j$('#number_aec_website').val();
        if (common.isNull(ctwebsite)) { ctwebsite = ''; } else { ctwebsite = common.Trim(ctwebsite); }
    }

    var ctTemp = [];
    ctTemp[common.CT_NAME] = currName;
    ctTemp[common.CT_NUMBER] = numbersTemp;
    ctTemp[common.CT_PTYPE] = typesTemp;
    ctTemp[common.CT_USAGE] = '0';
    ctTemp[common.CT_LASTMODIF] = modified;
    ctTemp[common.CT_DELFLAG] = '0';
    ctTemp[common.CT_FAV] = '0';
    ctTemp[common.CT_EMAIL] = ctemail;
    ctTemp[common.CT_ADDRESS] = ctaddress;
    ctTemp[common.CT_NOTES] = ctnotes;
    ctTemp[common.CT_WEBSITE] = ctwebsite;
    
    global.ctlist.push(ctTemp);
    global.wasCtModified = true;
    
    common.SortContacts();
    
    setTimeout(function ()
    {
        common.ShowToast(stringres.get('contact_saved'));
    }, 300);
    j$.mobile.back();
    return;
    
    } catch(err) { common.PutToDebugLogException(2, "_addeditcontact: SaveEditedContact", err); }
    try{ common.ShowToast(stringres.get('contact_save_error')); j$.mobile.back(); } catch(err2) { ; }
}

var MENUITEM_ADDEDITCONTACT_SAVE = '#menuitem_addeditcontact_save';
var MENUITEM_ADDEDITCONTACT_REVERT = '#menuitem_addeditcontact_revert';

function CreateOptionsMenu (menuId) // adding items to menu, called from html
{
    try{
// remove data transition for windows softphone, because it's slow
    if (common.IsWindowsSoftphone())
    {
        j$( "#btn_addeditcontact_menu" ).removeAttr('data-transition');
    }

    if ( common.isNull(menuId) || menuId.lenght < 1 ) { common.PutToDebugLog(2, "ERROR, _addeditcontact: CreateOptionsMenu menuid null"); return; }

    if (j$(menuId).length <= 0) { common.PutToDebugLog(2, "ERROR, _addeditcontact: CreateOptionsMenu can't get reference to Menu"); return; }
    
    if (menuId.charAt(0) !== '#') { menuId = '#' + menuId; }
    
    j$(menuId).html('');
    j$(menuId).append( '<li id="' + MENUITEM_ADDEDITCONTACT_SAVE + '"><a data-rel="back">' + stringres.get('btn_save') + '</a></li>' ).listview('refresh');
    
    j$(menuId).append( '<li id="' + MENUITEM_ADDEDITCONTACT_REVERT + '"><a data-rel="back">' + stringres.get('btn_revert') + '</a></li>' ).listview('refresh');

    return true;
    
    } catch(err) { common.PutToDebugLogException(2, "_addeditcontact: CreateOptionsMenu", err); }
    
    return false;
}

function MenuItemSelected(itemid)
{
    try{
    if (common.isNull(itemid) || itemid.length < 1) { return; }
    
    j$( '#addeditcontact_menu' ).on( 'popupafterclose', function( event )
    {
        j$( '#addeditcontact_menu' ).off( 'popupafterclose' );
        
        switch (itemid)
        {
            case MENUITEM_ADDEDITCONTACT_SAVE:
                SaveContact();
                break;
            case MENUITEM_ADDEDITCONTACT_REVERT:
                j$.mobile.back();
                break;
        }
    });
    } catch(err) { common.PutToDebugLogException(2, "_addeditcontact: MenuItemSelected", err); }
}

function onStop(event)
{
    try{
    common.PutToDebugLog(4, "EVENT, _addeditcontact: onStop");
    global.isAddeditcontactStarted = false;
    
// reset phone fields display
    var fieldcount = j$('#aec_number_fields').children().length;
    if (common.isNull(fieldcount) || fieldcount < 1) { return; }
    
    for (var i = 0; i < fieldcount; i++)
    {
        var newelement = document.getElementById('aec_entry_' + i);
        if ( !common.isNull(newelement))
        {
            newelement.style.display = 'none';
        }
    }
    
    j$('#aec_entry_email').hide();
    j$('#aec_entry_address').hide();
    j$('#aec_entry_notes').hide();
    j$('#aec_entry_website').hide();
    
    j$('#aec_entry_email').val('');
    j$('#aec_entry_address').val('');
    j$('#aec_entry_notes').val('');
    j$('#aec_entry_website').val('');
    
    j$('#aec_add_deatils').show();
    
    if (!common.isNull(nameField)) { nameField.value = ''; }
    
    } catch(err) { common.PutToDebugLogException(2, "_addeditcontact: onStop", err); }
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