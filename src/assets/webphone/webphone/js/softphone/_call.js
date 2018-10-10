/* global j$, common */

// Call page
//--define(['jquery', 'common', 'stringres', 'global'], function($, common, stringres, global)
wpa._call = (function ()
{
var calltype = '';
var callnumber = '';
var showcallfwd = false; // dislplay call forward option in menu: callforward csak bejovo hivas ring-nel
var showignore = false;
var hanguponchat = false; //-- bejovo hivasnal call ablakbol chat-et valaszt es ringing-ben van akkor hangup call
var callmode = 0;  //  callmode: 0=call-audio, 1=call-audiovideo, 2=call-screenshare


function onCreate (event) // called only once - bind events here
{
    try{
    common.PutToDebugLog(4, "EVENT, _call: onCreate");
    
    j$('#call_menu_ul').on('click', 'li', function(event)
    {
        MenuItemSelected(j$(this).attr('id'));
    });
    j$("#btn_call_menu").on("click", function()
    {
        CreateOptionsMenu('#call_menu_ul');
    });
    j$("#btn_call_menu").attr("title", stringres.get("hint_menu"));
    
    j$("#btn_hangup").on("click", function()
    {
        common.PutToDebugLog(4, 'EVENT, _call Hangup onclick');
        HangupCall();
    });
    
    j$("#btn_accept").on("click", function()
    {
        common.PutToDebugLog(4, 'EVENT, _call AcceptCall onclick');
        AcceptCall(true);
    });
    
    j$("#btn_reject").on("click", function()
    {
        common.PutToDebugLog(4, 'EVENT, _call RejectCall onclick');
        RejectCall(true);
    });
    
    j$("#btn_ml_accept").on("click", function()
    {
        common.PutToDebugLog(4, 'EVENT, _call multiline Accept onclick');
        AcceptCall(true);
    });
    
    j$("#btn_ml_reject").on("click", function()
    {
        common.PutToDebugLog(4, 'EVENT, _call RejectCallMultiline onclick');
        RejectCallMultiline(true);
    });
    
    j$("#btn_ml_more").on("click", function()
    {
        common.PutToDebugLog(4, 'EVENT, _call multiline more onclick');
        j$('#btn_call_menu').click();
    });
    
    j$("#btn_hangup").attr("title", stringres.get("hint_hangup"));
    j$("#btn_accept").attr("title", stringres.get("hint_accept"));
    j$("#btn_reject").attr("title", stringres.get("hint_reject"));
    j$("#calledcaller").attr("title", stringres.get("hint_called"));
    j$("#status_call").attr("title", stringres.get("hint_callstatus"));
    j$("#call_duration").attr("title", stringres.get("hint_callduration"));
    
//--    j$("#btn_accept_end").attr("title", stringres.get("hint_accept_end"));
//--    j$("#btn_reject_ml").attr("title", stringres.get("hint_reject_new"));
//--    j$("#btn_accept_hold").attr("title", stringres.get("hint_accept_hold"));
    j$("#btn_ml_accept").attr("title", stringres.get("hint_accept"));
    j$("#btn_reject_ml").attr("title", stringres.get("hint_reject_new"));
    j$("#btn_ml_more").attr("title", stringres.get("hint_more"));
    
    j$("#btn_audiodevice").on("click", function()
    {
        common.PutToDebugLog(4, 'EVENT, _call webphone_audiodevice onclick');
        webphone_api.devicepopup();
    });
    
    
  //--  var idx = 0;
    var timerid;
    j$( window ).resize(function() // window resize handling
    {
        if (j$.mobile.activePage.attr('id') === 'page_call')
        {
            if ( !common.isNull(timerid) ) { clearTimeout(timerid); }
            timerid = setTimeout(function ()
            {
                AddCallFunctions(false);
                MeasureCall();
//--                idx++;
//--                common.PutToDebugLog(2, 'idx = ' + idx);
            }, 100);
        }
    });
    
    j$("#numpad_btn_dp_1").on("click", function() { SendDtmf('1'); });
    j$("#numpad_btn_dp_2").on("click", function() { SendDtmf('2'); });
    j$("#numpad_btn_dp_3").on("click", function() { SendDtmf('3'); });
    j$("#numpad_btn_dp_4").on("click", function() { SendDtmf('4'); });
    j$("#numpad_btn_dp_5").on("click", function() { SendDtmf('5'); });
    j$("#numpad_btn_dp_6").on("click", function() { SendDtmf('6'); });
    j$("#numpad_btn_dp_7").on("click", function() { SendDtmf('7'); });
    j$("#numpad_btn_dp_8").on("click", function() { SendDtmf('8'); });
    j$("#numpad_btn_dp_9").on("click", function() { SendDtmf('9'); });
    j$("#numpad_btn_dp_0").on("click", function() { SendDtmf('0'); });
    j$("#numpad_btn_dp_ast").on("click", function() { SendDtmf('*'); });
    j$("#numpad_btn_dp_diez").on("click", function() { SendDtmf('#'); });
    
    
//--    j$( "#volumein" ).slider({
//--        create: function( event, ui ) { alert('slidecreate1'); }
//--    });
    
//--    j$( "#volumein" ).on( "slidecreate", function( event, ui )
//--    {
//--        var invalue = common.GetParameter('volumein');
        
//--        if (common.isNull(invalue) || invalue.length < 1 || !common.IsNumber(invalue))
//--        {
//--            invalue = '50';
//--        }
        
//--        this.value = invalue;
//--    });
        
    } catch(err) { common.PutToDebugLogException(2, "_call: onCreate", err); }
}

function onStart(event)
{
    try{
    common.PutToDebugLog(4, "EVENT, _call: onStart");
    global.isCallStarted = true;
    
    global.hangupPressedCount = 0;
    
    MeasureCall(); // resolve window height size change
    
    if (!common.isNull(document.getElementById("app_name_call"))
        && common.GetParameter('devicetype') !== common.DEVICE_WIN_SOFTPHONE())
    {
        document.getElementById("app_name_call").innerHTML = common.GetBrandName();
    }
    j$(".separator_line_thick").css( 'background-color', common.HoverCalc(common.getBgColor('#call_header'), -30) );
    
    j$('#btn_hangup_img').attr('src', '' + common.GetElementSource() + 'images/btn_hangup_txt.png');
    
    if (!common.isNull(document.getElementById('btn_audiodevice')))
    {
        document.getElementById('btn_audiodevice').innerHTML = stringres.get('btn_audio_device');
    }
    
    if (common.GetParameterBool('displayvolumecontrols', false) === true)
    {
        j$('#volumecontrols').show();
    }

    if (common.GetParameterBool('displayaudiodevice', false) === true)
    {
        j$('#audiodevice_container').show();
    }
    
    
// set volume controls values
    var invalue = common.GetParameter('volumein');
    if (common.isNull(invalue) || invalue.length < 1 || !common.IsNumber(invalue))
    {
        invalue = '50';
    }
    j$("#volumein").val(invalue);
    j$("#volumein").slider('refresh');
    
    var outvalue = common.GetParameter('volumeout');
    if (common.isNull(outvalue) || outvalue.length < 1 || !common.IsNumber(outvalue))
    {
        outvalue = '50';
    }
    j$("#volumeout").val(outvalue);
    j$("#volumeout").slider('refresh');
    
// handle volume control on change
    j$( "#volumein" ).on( "slidestop", function( event, ui )
    {
        var setval = this.value;
        
        if (common.isNull(setval) || setval.length < 1) { return; }
        
        setval = common.Trim(setval);

        common.SaveParameter('volumein', setval);
        common.PutToDebugLog(5, 'EVENT, volumein slidestop: ' + this.value);
        
        //  -0 for the recording (microphone) audio device
        //  -1 for the playback (speaker) audio device
        //  -2 for the ringback (speaker) audio device
        webphone_api.setvolume(0, setval);
    });
    
    j$( "#volumeout" ).on( "slidestop", function( event, ui )
    {
        var setval = this.value;
        
        if (common.isNull(setval) || setval.length < 1) { return; }
        
        setval = common.Trim(setval);

        common.SaveParameter('volumeout', setval);
        common.PutToDebugLog(5, 'EVENT, volumeout slidestop: ' + this.value);
        
        webphone_api.setvolume(1, setval);
    });
    
    calltype  = common.GetIntentParam(global.intentcall, 'calltype');
    var callmodestr  = common.GetIntentParam(global.intentcall, 'callmode');
    if (!common.isNull(callmodestr) && common.IsNumber(callmodestr)) { callmode = common.StrToInt(callmodestr); }
    

//--if (global.isdebugversionakos)
//--{
//--    calltype = 'outgoing';
//--}

//--##AKOS
//calltype = 'outgoing';

    global.callName = ''; // reset global.callName
    
    callnumber = common.GetIntentParam(global.intentcall, 'number');
    global.callName = common.GetIntentParam(global.intentcall, 'name');
    
    if (common.isNull(global.callName) || global.callName.length < 1)
    {
        global.callName = common.GetContactNameFromNumber(callnumber);
    }
    
    var telsearchurl = common.GetParameter2('telsearchurl');
    if (common.isNull(telsearchurl) || telsearchurl.length < 3) { telsearchurl = webphone_api.parameters['telsearchurl']; }
    if (!common.isNull(telsearchurl) && telsearchurl.length > 3 && (global.callName.length < 1 || global.callName === callnumber))
    {
        webphone_api.gettelsearchname(callnumber, function (recname)
        {
            if (common.isNull(recname) || recname.length < 2 || recname.length > 60) { return; }
            global.telsearchname = recname;
            global.callName = recname;
            peerdetails = global.callName + '&nbsp;(' + callnumber + ')&nbsp;';
            j$('#calledcaller').html(peerdetails);
            j$('#page_call_peer_details').html(peerdetails);
        });
    }
    
// don't display username and name, if both are the same
    var peerdetails = '';
    if (global.callName !== callnumber)
    {
        peerdetails = global.callName + '&nbsp;(' + callnumber + ')&nbsp;';
        j$('#calledcaller').html(peerdetails);
    }else
    {
        peerdetails = callnumber;
        j$('#calledcaller').html(peerdetails);
    }
    
    NormalizeDisplayDetails(peerdetails);
    if (calltype === "incoming")
    {
        webphone_api.GetIncomingDisplay(function (disp)
        {
            if (!common.isNull(disp) && disp.length > 0 && peerdetails.indexOf(disp) < 0)
            {
                peerdetails = disp + ' ' + peerdetails;
            }
            
            NormalizeDisplayDetails(peerdetails);
        });
    }
    
    
// handle hangup / acceptreject layouts (icoming / outgoing call)
    if (calltype === "outgoing")
    {
        AddCallFunctions(false);
        
        j$('#acceptreject_layout').hide();
        j$('#hangup_layout').show();
        j$('#callfunctions_layout').show();
        
//--        if (!global.isdebugversionakos)
//--        {
//--            webphone_api.call(-1, callnumber);
            
            setTimeout(function ()
            {
                var ratinguri = common.GetParameter('ratingrequest');
                if ( common.Glbr() === true && !common.isNull(ratinguri) && ratinguri.length > 2 && !common.isNull(callnumber) && callnumber.length > 0
                        && (common.isNull(global.rating) || (global.rating).length < 1) ) // means rating is not received from signaling
                {
                    webphone_api.needratingrequest(function (val) // API_NeedRatingRequest
                    {
                        if (val === true)
                        {
                            common.UriParser(ratinguri, '', callnumber, '', '', 'getrating');
                        }
                    });
                }
            }, 4000);
//--        }
    }

    if (calltype === "incoming")
    {
        if (common.GetParameter2('autoaccept') === 'true')
        {
            j$('#hangup_layout').show();
            j$('#callfunctions_layout').show();
            j$('#acceptreject_layout').hide();
        }else
        {
//--             normal call
            AddCallFunctions(true);
            showignore = true;
            hanguponchat = true;
            j$('#hangup_layout').hide();
            j$('#callfunctions_layout').hide();
            j$('#acceptreject_layout').show();
        }
    }
    
    if (callmode > 0 && common.CanIUseVideo() === true)
    {
        j$('#contact_details').hide();
        j$('#video_container').show();
        if (common.GetParameterInt('softphonevideomode', 0) === 1) // hide Full Screeen button in windows softphone, because it's not working
        {
            j$('#div_video_fullscreen_button').hide();
        }
        common.PutToDebugLog(2, 'EVENT, call onstart video container displayed');
    }
    
if (global.isdebugversionakos === true)
{
    j$('#mline_layout').show();
}
    
    MeasureCall();
    setTimeout(function () { MeasureCall(); }, 200);
    
    } catch(err) { common.PutToDebugLogException(2, "_call: onStart", err); }
}

// display other party details
// search details and don't show the same string twice: for example caller or display name
function NormalizeDisplayDetails(det_in)
{
    try{
    if (common.isNull(det_in) || det_in.length < 1)
    {
        j$('#page_call_peer_details').html('');
        return;
    }
    if (det_in.indexOf(' ') < 0)
    {
        j$('#page_call_peer_details').html(det_in);
        return;
    }
    
    det_in = common.ReplaceAll(det_in, '-', ' ');
    var det = '';
    var darr = det_in.split(' ');
    
    var idx = 0;// remove any empty/invalid entries
    while (idx < darr.length)
    {
        if (common.isNull(darr[idx]) || common.Trim(darr[idx]).lengh < 1)
        {
            darr.splice(idx, 1);
        }else
        {
            idx++;
        }
    }
    
    var middle = Math.ceil(darr.length / 2);
    for (var i = 0; i < darr.length; i++)
    {
        if (common.isNull(darr[i]) || common.Trim(darr[i]).lengh < 1) { continue; }
        
        if (det.indexOf(darr[i]) < 0)
        {
            if (det.length > 0)
            {
                if (i === middle)
                {
                    det = det + '<br>';
                }else
                {
                    det = det + ' ';
                }
            }
            det = det + darr[i];
        }
    }
    
    j$('#page_call_peer_details').html(det);
    
    } catch(err) { common.PutToDebugLogException(2, "_call: NormalizeDisplayDetails", err); }
}

function OnNewIncomingCall()
{
    try{
    var ep = common.GetEndpoint(global.aline, '', '', false);
    if (common.isNull(ep) || ep.length < 5)
    {
        common.PutToDebugLog(2, 'ERROR, _call OnNewIncomingCall: ep is NULL for line: ' + global.aline.toString());
        return;
    }
    
    var innr = ep[common.EP_DESTNR];
    j$('#mline_layout').show();
    
    if (j$('#hangup_layout').is(':visible'))
    {
        j$('#hangup_layout').hide();
    }
    if (j$('#acceptreject_layout').is(':visible'))
    {
        j$('#acceptreject_layout').hide();
    }
    
    common.RefreshInfo();
    
    setTimeout(function () { MeasureCall(); }, 200);
    
    } catch(err) { common.PutToDebugLogException(2, "_call: OnNewIncomingCall", err); }
}

function RejectCallMultiline(callapi)
{
    try{
    showignore = false;
    hanguponchat = false;
    j$('#mline_layout').hide();
    j$('#callfunctions_layout').show();
    j$('#hangup_layout').show();
    setTimeout(function () { MeasureCall(); }, 200);

    global.acceptReject = true;
//--    global.hangupPressedCount = 1;
    
//find last incoming call to reject; because maybe user changed line, but even then reject the incoming line
    if (callapi)
    {
        var linetoreject = global.aline; // 1=outgoing, 2=incoming
        var setuptime = 0;

        for (var i = 0; i < global.ep.length; i++)
        {
            if (common.isNull(global.ep[i]) || global.ep[i].length < 5) { continue; }
            if (global.ep[i][common.EP_INCOMING] !== '2') { continue; }
            
            var stime = common.StrToInt(global.ep[i][common.EP_SETUPTIME]);
            if (!common.isNull(stime) && common.IsNumber(stime) && stime > setuptime)
            {
                setuptime = stime;
                linetoreject = global.ep[i][common.EP_LINE];
            }
        }

        plhandler_public.Reject(linetoreject);

    // update lines (remove line and set last active line)
        for (var i = 0; i < global.ep.length; i++)
        {
            if (common.isNull(global.ep[i]) || global.ep[i].length < 5) { continue; }

            var lntmp = global.ep[i][common.EP_LINE];
            if (lntmp == global.aline)
            {
                global.ep[i][common.EP_FLAGDEL] = 'true';
                break;
            }
        }
        
    // find last active line
        for (var i = global.ep.length - 1; i >= 0; i--)
        {
            if (common.isNull(global.ep[i]) || global.ep[i].length < 5) { continue; }

            if (global.ep[i][common.EP_FLAGDEL] == 'false')
            {
                // found one active line, set it
                common.PutToDebugLog(2, 'EVENT, SetLine called from RejectCallMultiline');
                webphone_api.setline(common.StrToInt(global.ep[i][common.EP_LINE]));
                break;
            }
        }
        
//--        UpdateLineUI();
        setTimeout(function ()
        {
            common.RefreshInfo();
        }, 400);
    }
    callmode = 0;
    } catch(err) { common.PutToDebugLogException(2, "_call: RejectCallMultiline", err); }
}

function AcceptHold(callapi)
{
    try{
    global.acceptReject = true;
    
    AddCallFunctions(false);
    showignore = false;
    hanguponchat = false;
    
    j$('#mline_layout').hide();
    j$('#hangup_layout').show();
    j$('#callfunctions_layout').show();
    
    setTimeout(function () { MeasureCall(); }, 200);

    if (callapi)
    {
        // find previous active line to put that call on hold
        var prevline = -10;
        var setuptimeTmp = 0;
        if (!common.isNull(global.ep))
        {
            for (var i = 0; i < global.ep.length; i++)
            {
                var eptmp = global.ep[i];
                if (common.isNull(eptmp) || eptmp.length < 1) { continue; }
                
                if (eptmp[common.EP_FLAGDEL] === 'true') { continue; }
                
                if (!common.isNull(eptmp[common.EP_LINE]) && common.IsNumber(eptmp[common.EP_LINE]) === true)
                {
                    if (setuptimeTmp < common.StrToInt(eptmp[common.EP_SETUPTIME]))
                    {
                        prevline = common.StrToInt(eptmp[common.EP_LINE]);
                    }
                }
            }
        }
        
        common.PutToDebugLog(2, 'EVENT, mlogic API_Accept AcceptHold');
        webphone_api.accept(global.aline);

        if (prevline > 0)
        {
            plhandler_public.Hold(true, prevline);
            setTimeout(function ()
            {
                AddCallFunctions(false);
            }, 250);

            common.PutToDebugLog(2, 'EVENT, AcceptHold hold finished');
        }
    }
    } catch(err) { common.PutToDebugLogException(2, "_call: AcceptHold", err); }
}

function AcceptEnd(callapi)
{
    try{
    global.acceptReject = true;
    
    AddCallFunctions(false);
    showignore = false;
    hanguponchat = false;
    
    j$('#mline_layout').hide();
    j$('#hangup_layout').show();
    j$('#callfunctions_layout').show();
    
    setTimeout(function () { MeasureCall(); }, 200);

    if (callapi)
    {
        // find previous active line to end that call
        var prevline = -10;
        var setuptimeTmp = 0;
        if (!common.isNull(global.ep))
        {
            for (var i = 0; i < global.ep.length; i++)
            {
                var eptmp = global.ep[i];
                if (common.isNull(eptmp) || eptmp.length < 1) { continue; }
                
                if (eptmp[common.EP_FLAGDEL] === 'true') { continue; }
                
                if (!common.isNull(eptmp[common.EP_LINE]) && common.IsNumber(eptmp[common.EP_LINE]) === true)
                {
                    if (setuptimeTmp < common.StrToInt(eptmp[common.EP_SETUPTIME]))
                    {
                        prevline = common.StrToInt(eptmp[common.EP_LINE]);
                    }
                }
            }
        }
        
        common.PutToDebugLog(2, 'EVENT, AcceptEnd called');
        
        plhandler_public.Accept(global.aline);
        
        if (prevline > 0)
        {
            common.PutToDebugLog(2, 'EVENT, hangup AcceptEnd');
            plhandler_public.Hangup(prevline);
        }
    }
    } catch(err) { common.PutToDebugLogException(2, "_call: AcceptEnd", err); }
}

function MeasureCall() // resolve window height size change
{
    try{
//--    var pgh = common.GetDeviceHeight() - 1; j$('#page_call').css('min-height', pgh + 'px'); // must be set when softphone is skin in div
    j$('#page_call').css('min-height', 'auto'); // must be set when softphone is skin in div

    var volumevisible = false;
    var audiodevicevisible = false;
    if (j$('#volumecontrols').is(':visible')) { volumevisible = true; }
    if (j$('#audiodevice_container').is(':visible')) { audiodevicevisible = true; }

    j$("#page_call_content").height(common.GetDeviceHeight() - j$("#call_header").height() -j$('.separator_line_thick').height());

    var pageHeight = common.GetDeviceHeight() - j$("#call_header").height();
    j$('#page_call_content').height(pageHeight - 3);
    var max_vid_height = pageHeight - 3;
    
    
    var numpadHeight = pageHeight - j$("#hangup_layout").height() - j$("#callfunctions_layout").height() - j$(".separator_color_bg").height() - 12;
    if (j$('#mlcontainer').is(':visible')) { numpadHeight = numpadHeight - j$('#mlcontainer').height() - 2; }
    
    var rowHeight = Math.floor(numpadHeight / 5);
    j$("#numpad_btn_grid .ui-btn").height(rowHeight);
    rowHeight = rowHeight - 6;
    
    j$("#numpad_number_container").height(rowHeight);
    j$("#numpad_number_container").css("line-height", rowHeight + "px");
    
    if (calltype === "outgoing")
    {
        pageHeight = pageHeight - j$("#hangup_layout").height() - j$("#callfunctions_layout").height() - j$(".separator_color_bg").height() - 1;
        
        if (volumevisible) { pageHeight = pageHeight - j$("#volumecontrols").height(); }
        if (audiodevicevisible) { pageHeight = pageHeight - j$("#audiodevice_container").height(); }
        pageHeight = pageHeight - j$("#mlcontainer").height() - j$(".separator_line_thick").height();
        pageHeight = Math.floor(pageHeight);

        j$("#contact_image").height(  pageHeight );
//--        j$("#contact_image").css("line-height", pageHeight + "px");
        var mTop = (pageHeight - j$("#contact_image_img").height() - j$("#page_call_additional_info").height()) / 2;
        j$("#contact_image_img").css("margin-top", mTop + "px");
    }

    if (calltype === "incoming")
    {
        if (document.getElementById('acceptreject_layout').style.display === 'block')
        {
            pageHeight = pageHeight - j$("#acceptreject_layout").height() - 3;
            if (volumevisible) { pageHeight = pageHeight - j$("#volumecontrols").height(); }
            if (audiodevicevisible) { pageHeight = pageHeight - j$("#audiodevice_container").height(); }
            pageHeight = pageHeight - j$("#mlcontainer").height() - j$(".separator_line_thick").height();
            pageHeight = Math.floor(pageHeight);
        }else
        {
            pageHeight = pageHeight - j$("#hangup_layout").height() - j$("#callfunctions_layout").height() - j$(".separator_color_bg").height() - 1;
            if (volumevisible) { pageHeight = pageHeight - j$("#volumecontrols").height(); }
            if (audiodevicevisible) { pageHeight = pageHeight - j$("#audiodevice_container").height(); }
            pageHeight = pageHeight - j$("#mlcontainer").height() - j$(".separator_line_thick").height();
            pageHeight = Math.floor(pageHeight);
        }

        j$("#contact_image").height(  pageHeight );
//--        j$("#contact_image").css("line-height", pageHeight + "px");
        var mTop = (pageHeight - j$("#contact_image_img").height() - j$("#page_call_additional_info").height()) / 2;
        j$("#contact_image_img").css("margin-top", mTop + "px");
    }
    
    var brandW = Math.floor(common.GetDeviceWidth() / 4.6);
    j$("#app_name_call").width(brandW);
    
// handle video container height/aspect ratio
    if (j$('#video_container').is(':visible'))
    {
        var vh = j$('#video_remote').height();
        if (!common.isNull(vh) && common.IsNumber(vh))
        {
            vh = vh - 45; // space for full screen button (for some reason video_container reports invalid height value so we have to use video remote DIV)
            max_vid_height = max_vid_height - j$("#hangup_layout").height() - j$("#callfunctions_layout").height() - j$(".separator_color_bg").height() - 1;
            
            if (vh > max_vid_height)
            {
                j$('#video_container').height(max_vid_height);
                j$('#video_remote').height(max_vid_height - 45);
            }
        }
    }
    
    } catch(err) { common.PutToDebugLogException(2, "_call: MeasureCall", err); }
}

function HangupCall()
{
    try{
        // reset mute, hold, speaker buttons state
//--    j$('#mute_status').removeClass("callfunc_status_on");
//--    j$('#hold_status').removeClass("callfunc_status_on");
//--    j$('#speaker_status').removeClass("callfunc_status_on");

    global.dontshowdiscreason = true;
    if (global.acallcount < 2)
    {
        global.hangupPressedCount++;
    }
    
    common.PutToDebugLog(4, 'EVENT, _call HangupCall');

    if (global.hangupPressedCount < 2)
    {
        if (global.acallcount < 2 && (common.isNull(global.waiting_conf_numbers) || global.waiting_conf_numbers.length < 1) && global.dontshow_closecall === false)
        {
            j$('#callfunctions_layout').hide();
            j$('#btn_hangup_img').attr('src', '' + common.GetElementSource() + 'images/btn_close_txt.png');
            j$("#btn_hangup").attr("title", stringres.get("hint_closecall"));
        }
        webphone_api.hangup();
        
//--        UpdateLineUI();
        setTimeout(function ()
        {
            common.RefreshInfo();
        }, 400);
    }
    else if (global.hangupPressedCount > 1)
    {
        webphone_api.hangup();
        j$.mobile.back();

        global.hangupPressedCount = 0;
    }
    callmode = 0;

    } catch(err) { common.PutToDebugLogException(2, "_call: HangupCall", err); }
}

function AcceptCall(callapi)
{
    try{
    global.acceptReject = true;
    
    AddCallFunctions(false);
    showignore = false;
    hanguponchat = false;
    
    j$('#mline_layout').hide();
    j$('#acceptreject_layout').hide();
    j$('#hangup_layout').show();
    j$('#callfunctions_layout').show();
    
    setTimeout(function () { MeasureCall(); }, 200);

//--    CallfunctionUsage(); TODO: implement
    
    if (callapi)
    {
        webphone_api.accept(-2);
    }
    } catch(err) { common.PutToDebugLogException(2, "_call: AcceptCall", err); }
}

function RejectCall(callapi)
{
    try{
    showignore = false;
    hanguponchat = false;
    j$('#mline_layout').hide();
    j$('#acceptreject_layout').hide();
    if (global.acallcount < 2)
    {
        j$('#callfunctions_layout').hide();
    }
    j$('#hangup_layout').show();
    setTimeout(function () { MeasureCall(); }, 200);

    global.acceptReject = true;
    global.hangupPressedCount = 1;
    
    if (callapi)
    {
        webphone_api.reject(-2);
    }
    callmode = 0;

    } catch(err) { common.PutToDebugLogException(2, "_call: RejectCall", err); }
}

function SendDtmf(numChar)
{
    try{
    common.PutToDebugLog(5,"EVENT, _call SendDtmf: " + numChar);
    	
    webphone_api.dtmf(numChar, -1);

    var currNumVal = j$('#numpad_number').html();
    if (common.isNull(currNumVal)) { currNumVal = ''; }
    
    if (currNumVal.length > 18) { currNumVal = currNumVal.substring(10, currNumVal.length) + ' '; }
    
    j$('#numpad_number').html(currNumVal + numChar);
    
    } catch(err) { common.PutToDebugLogException(2, "_call: SendDtmf", err); }
}

function CloseCall()
{
    try{
    common.PutToDebugLog(3, 'EVENT, _call CloseCall');
    j$.mobile.back();
    } catch(err) { common.PutToDebugLogException(2, "_call: CloseCall", err); }
}

// show close button if the caller hangs up before it is accepted or rejected
function OnCallerHangup() //--TODO:
{
    try{
//--            if (isVideoOn) VideoOnPause(); // stop video

    global.hangupPressedCount = 1;

    } catch(err) { common.PutToDebugLogException(2, "_call: OnCallerHangup", err); }
}

var lastBtns = '';
function UpdateLineButtons()
{
    try{
    if (common.IsSDK() === true) { return; }
    var mlcont = document.getElementById('mlcontainer');
    if (common.isNull(mlcont)) { return; }
        
    var ml_btns = document.getElementById('ml_buttons');
    if (common.isNull(ml_btns)) { return; }
    
    
    if (common.isNull(global.ep) || global.ep.length < 1) { return; }
    
    var template = '' +
        '<button class="ui-btn line_btn noshadow" data-theme="b" id="btn_line_[LINENR]">' +
            '<span class="line_text">' + stringres.get('line_title') + ' [LINENR]</span>' +
            '<span class="line_status [ISACTIVE]" id="line_[LINENR]_status" >&nbsp;</span>' +
        '</button>';
    
    
    var buttonIds = [];
    var currBtns = '';
    for (var i = 0; i < global.ep.length; i++)
    {
        var item = global.ep[i];
        if (common.isNull(item) || item.length < 1) { continue; }
        
        var lntmp = item[common.EP_LINE];
        if (common.isNull(lntmp) || lntmp.length < 1 || common.IsNumber(lntmp) === false) { continue; }
        
        var iline = common.StrToInt(lntmp);
        
        var isActive = '';
        if (global.aline == iline)
        {
            isActive = 'line_status_on';
        }
        
        var btn = common.ReplaceAll(template, '[LINENR]', iline.toString());
        btn = btn.replace('[ISACTIVE]', isActive);
        
        currBtns += btn;
        buttonIds.push(iline.toString());
    }
    
    if (currBtns === lastBtns)
    {
        return;
    }else
    {
        lastBtns = currBtns;
    }
    
    ml_btns.innerHTML = currBtns;
    
    for (var i = 0; i < buttonIds.length; i++)
    {
        j$('#btn_line_' + buttonIds[i]).off('click');
        j$('#btn_line_' + buttonIds[i]).on('click', function (e)
        {
            LineCliked(j$(this).attr('id'));
        });
    }
    
    if (buttonIds.length > 1) // display buttons only if there are at least 2 lines
    {
        if (mlcont.style.display === 'none') { mlcont.style.display = 'block'; }
    }else
    {
        ml_btns.innerHTML = '';
        mlcont.style.display = 'none';
    }
    
    common.RefreshInfo();
    MeasureCall();
    
    } catch(err) { common.PutToDebugLogException(2, "_call: UpdateLineButtons", err); }
}

function LineCliked(id)
{
    try{
    if (common.IsSDK() === true) { return; }
    if (common.isNull(id) || id.indexOf('btn_line_') !== 0)
    {
        common.PutToDebugLog(2, 'ERROR, _call: LineCliked invalid id: ' + id);
        return;
    }
    id = id.replace('btn_line_', '');
    var line = common.StrToInt(id);
    
    common.PutToDebugLog(1, 'EVENT, Line ' + line.toString() + ' selected by user');
    webphone_api.setline(line);
    
    var mutedirection = common.GetParameterInt('defmute', 0);
    
    for (var i = 0; i < global.ep.length; i++)
    {
        var item = global.ep[i];
        if (common.isNull(item) || item.length < 1) { continue; }
        
        var lntmp = item[common.EP_LINE];
        if (common.isNull(lntmp) || lntmp.length < 1 || common.IsNumber(lntmp) === false) { continue; }
        var iline = common.StrToInt(lntmp);
        
// handle automute/autohold     4=on other line button click
//-- ha az automute és/vagy autohold  4-re van állitva, akkor kezelni kéne a vissza váltás –t is (amelyik line –ra váltunk, arra kell unhold/unmute).
//--if (common.getuseengine() === global.ENGINE_WEBRTC)
//--{
        if (global.aline == iline)
        {
            if (common.GetParameter('automute') == '4')
            {
                
                if (item[common.EP_MUTESTATE] == 'true') // if is muted
                {
// call directly to engine API files to be able to pass exact line

                    common.PutToDebugLog(2, 'EVENT, EVENT, USER, automute, API_MuteEx, false on line: ' + iline + '; dest: ' + item[common.EP_DESTNR]);
                    if (common.getuseengine() === global.ENGINE_WEBRTC)
                    {
                        wpa.webrtcapi.SipToggleMute(false, mutedirection, iline);
                    }
                    else if (common.GetParameter('devicetype') === common.DEVICE_WIN_SOFTPHONE() || common.getuseengine() === global.ENGINE_SERVICE)
                    {
                        common.WinAPI('API_MuteEx', null, iline, false, mutedirection);
                    }
                    else if (common.getuseengine() === global.ENGINE_WEBPHONE)
                    {
                        wpa.webphone.MuteEx(iline, false, mutedirection);
                    }
                    
                    global.ep[i][common.EP_MUTESTATE] = 'false';
                }
            }

            if (common.GetParameter('autohold') == '4')
            {
                if (item[common.EP_HOLDSTATE] == 'true') // if is on hold
                {
                    common.PutToDebugLog(2, 'EVENT, EVENT, USER, autohold, API_Hold, false on line: ' + iline + '; dest: ' + item[common.EP_DESTNR]);
                    if (common.getuseengine() === global.ENGINE_WEBRTC)
                    {
                        wpa.webrtcapi.SipToggleHoldResume(false, iline);
                    }
                    else if (common.GetParameter('devicetype') === common.DEVICE_WIN_SOFTPHONE() || common.getuseengine() === global.ENGINE_SERVICE)
                    {
                        common.WinAPI('API_Hold', null, iline, false);
                    }
                    else if (common.getuseengine() === global.ENGINE_WEBPHONE)
                    {
                        wpa.webphone.Hold(iline, false);
                    }
                    
                    global.ep[i][common.EP_HOLDSTATE] = 'false';
                }
            }
        }else
        {
            if (common.GetParameter('automute') == '4')
            {
                if (item[common.EP_MUTESTATE] == 'false') // if not muted
                {
                    common.PutToDebugLog(2, 'EVENT, EVENT, USER, automute, API_MuteEx, true on line: ' + iline + '; dest: ' + item[common.EP_DESTNR]);
                    if (common.getuseengine() === global.ENGINE_WEBRTC)
                    {
                        wpa.webrtcapi.SipToggleMute(true, mutedirection, iline);
                    }
                    else if (common.GetParameter('devicetype') === common.DEVICE_WIN_SOFTPHONE() || common.getuseengine() === global.ENGINE_SERVICE)
                    {
                        common.WinAPI('API_MuteEx', null, iline, true, mutedirection);
                    }
                    else if (common.getuseengine() === global.ENGINE_WEBPHONE)
                    {
                        wpa.webphone.MuteEx(iline, true, mutedirection);
                    }
                    
                    global.ep[i][common.EP_MUTESTATE] = 'true';
                }
            }

            if (common.GetParameter('autohold') == '4')
            {
                if (item[common.EP_HOLDSTATE] == 'false') // if not on hold
                {
                    common.PutToDebugLog(2, 'EVENT, EVENT, USER, autohold, API_Hold, true on line: ' + iline + '; dest: ' + item[common.EP_DESTNR]);
                    if (common.getuseengine() === global.ENGINE_WEBRTC)
                    {
                        wpa.webrtcapi.SipToggleHoldResume(true, iline);
                    }
                    else if (common.GetParameter('devicetype') === common.DEVICE_WIN_SOFTPHONE() || common.getuseengine() === global.ENGINE_SERVICE)
                    {
                        common.WinAPI('API_Hold', null, iline, true);
                    }
                    else if (common.getuseengine() === global.ENGINE_WEBPHONE)
                    {
                        wpa.webphone.Hold(iline, true);
                    }
                    
                    global.ep[i][common.EP_HOLDSTATE] = 'true';
                }
            }
        }
//--}
    }
    
    
    
    UpdateLineButtons();
    
    AddCallFunctions(false);
    MeasureCall();

    } catch(err) { common.PutToDebugLogException(2, "_call: LineCliked", err); }
}

// change active line, add line buttons and display otion for call
function NewMultilineCall(phoneNr)
{
    try{
    common.PutToDebugLog(2, 'EVENT, NewMultilineCall');
    
    if (global.isdebugversionakos)
    {
        common.GetContacts(function () {});
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
'<div id="mlcall_popup" data-role="popup" class="ui-content messagePopup" data-overlay-theme="a" data-theme="a" style="max-width:' + popupWidth + 'px;">' +

    '<div data-role="header" data-theme="b">' +
        '<a href="javascript:;" data-role="button" data-icon="delete" data-iconpos="notext" class="ui-btn-right closePopup">Close</a>' +
        '<h1 class="adialog_title">' + stringres.get('menu_multilinecall') + '</h1>' +
    '</div>' +
    '<div role="main" class="ui-content adialog_content adialog_btn_nexttoinput">' +
        '<span>' + stringres.get('phone_nr') + '</span>' +
        '<div style="clear: both;"><!--//--></div>' +
        '<input type="text" id="mlcall_input" name="setting_item" data-theme="a" autocapitalize="off"/>' +
        '<button id="btn_pickct" class="btn_nexttoinput ui-btn ui-btn-corner-all ui-btn-b noshadow"><img src="' + common.GetElementSource() + 'images/' + btnimage + '"></button>' +
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
            j$('#btn_pickct').off('click');
            popupafterclose();
        }
    });
    
//-- listen for enter onclick, and click OK button
//-- no need for this, because it reloads the page
//--    j$( "#mlcall_popup" ).keypress(function( event )
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

    var textBox = document.getElementById('mlcall_input');
    if (!common.isNull(phoneNr) && phoneNr.length > 0) { textBox.value = phoneNr; }
    if (!common.isNull(textBox)) { textBox.focus(); } // setting cursor to text input

    j$('#adialog_positive').on('click', function (event)
    {
        common.PutToDebugLog(5,'EVENT, call NewMultilineCall ok onclick');

        var textboxval = common.Trim(textBox.value);
        
        if (!common.isNull(textboxval) && textboxval.length > 0)
        {
            webphone_api.call(textboxval);
            
            common.RefreshInfo();
        }else
        {
            common.ShowToast(stringres.get('err_msg_4'));
            j$.mobile.back();
        }
    });

    j$('#adialog_negative').on('click', function (event)
    {
        ;
    });

    j$('#btn_pickct').on('click', function (event)
    {
        j$.mobile.activePage.find(".messagePopup").popup("close");

        j$( '#mlcall_popup' ).on( 'popupafterclose', function( event )
        {
            j$( '#mlcall_popup' ).off( 'popupafterclose' );

            common.PickContact(NewMultilineCall);
        });
    });
    } catch(err) { common.PutToDebugLogException(2, "_call: NewMultilineCall", err); }
}

//-- addcallfwd: true/false   callforward csak bejovo hivas ring-nel
function AddCallFunctions(addcallfwd)
{
    try{
    if (common.IsSDK() === true) { return; }
    if (common.GetParameterInt('featureset', 10) < 0)
    {
        j$('#callfunctions_layout').hide();
        MeasureCall();
        return;
    }
    
    showcallfwd = addcallfwd;

    var content = '';
    j$('#callfunctions_layout').html('');

    var availableFunc = common.GetAvailableCallfunctions();
    if ( common.isNull(availableFunc) || availableFunc.length < 3)
    {
        common.PutToDebugLog(2, 'ERROR, _call: AddCallFunctions no available callfunctions (1)');
        return;
    }

    var callfunc = document.getElementById("callfunctions_layout");
    if ( common.isNull(callfunc) )
    {
        common.PutToDebugLog(2, 'ERROR, _call: AddCallFunctions no available callfunctions (2)');
        return;
    }
    
    var usageStr = common.GetParameter('callfunctionsbtnusage');
    if (common.isNull(usageStr) || usageStr.length <= 0)
    {
        usageStr = '10,0,5,9,8,10,12,1,3,-2';
        common.SaveParameter('callfunctionsbtnusage', usageStr); // DoVersioning
    }

// calculate video priority
    var postmp = usageStr.lastIndexOf(',');
    var videop = common.StrToInt(usageStr.substring(postmp + 1));
    var newUsageStr = usageStr.substring(0, postmp);
    if (common.IsNumber(videop) && common.CanIUseVideo() && videop < 1)
    {
        videop = 3;
        usageStr = newUsageStr + ',' + videop.toString();
        common.SaveParameter('callfunctionsbtnusage', usageStr);
    }


    var tmp = '';
    var usage = usageStr.split(',');
    var usageNames = ["callforward","conference", "transfer", "mute", "hold", "speaker", "numpad", "bluetooth", "chat", "video"];
    
    if (addcallfwd !== true)
    {
        usage.splice(0, 1);
        usageNames.splice(0, 1);
    }
    
    for (var i = 0; i < usage.length; i++)
    {
        for (var j = i + 1; j < usage.length; j++)
        {
            var usi = 0;
            var usj = 0;

            try{
            usi = common.StrToInt(usage[i].trim());
            usj = common.StrToInt(usage[j].trim());
            }catch(ein){  common.PutToDebugLogException(2,"_call AddCallFunctions parseint", ein); }

            //--if( usage[i].compareTo(usage[j]) < 0 )
            if( usi < usj )
            {
                tmp = usage[i];
                usage[i] = usage[j];
                usage[j] = tmp;

                tmp = usageNames[i];
                usageNames[i] = usageNames[j];
                usageNames[j] = tmp;
            }
        }
    }

    if (global.isdebugversionakos === true) {for (var i = 0; i < usage.length; i++) { common.PutToDebugLog(5, "cfusage " + usageNames[i] + ": " + usage[i]); }}

// get list of available call functions baesd on which engine is used
    var funcArray = availableFunc.split(',');
    var funchtml = '';

    if (common.isNull(funcArray) || funcArray.length < 1)
    {
        common.PutToDebugLog(2, 'ERROR, _call: AddCallFunctions no available callfunctions (3)');
        return;
    }
    
// wheter to display more button
    var dispmorebtn = false;
    if (global.nrOfCallfunctionsToDisplay === 0) { global.nrOfCallfunctionsToDisplay = 5; }
    if (global.nrOfCallfunctionsToDisplay > funcArray.length) { global.nrOfCallfunctionsToDisplay = funcArray.length; }
    	
    if (funcArray.length > 5) dispmorebtn = true;
    
// build html
    var count = 0;
//--    if (common.isNull(content) || content.length < 10) // if content not yet added, then add it
//--    {
    var template = '' +
        '<div class="callfunc_btn_container">' +
            '<button class="ui-btn callfunc_btn noshadow" data-theme="b" id="btn_[REPLACESTR]">' +
                '<img src="' + common.GetElementSource() + 'images/btn_[REPLACESTR]_txt.png" />' +
                '<span class="callfunc_status" id="[REPLACESTR]_status" >&nbsp;</span>' +
            '</button>' +
        '</div>';


    var spacer = '<div class="callfunc_spacer">&nbsp;</div>';

    for (var i = 0; i < usageNames.length; i++)
    {
        var cfitem = usageNames[i];
        if (common.isNull(cfitem) || common.Trim(cfitem).length < 1 ) { continue; }
        if ((availableFunc.toLowerCase()).indexOf(cfitem) < 0) { continue; }

        // WebRTC engine hasn't got conference
        if (common.getuseengine() === global.ENGINE_WEBRTC && cfitem === 'conference') { continue; }

    // conference, transfer, mute, hold, speaker, numpad, bluetooth, chat, video
        var item = common.ReplaceAll(template, '[REPLACESTR]', cfitem);
        funchtml = funchtml + item;
        if (i < global.nrOfCallfunctionsToDisplay - 1) { funchtml = funchtml + spacer; }

        count++;

    // add moer button and stop adding cf items
        if (dispmorebtn && count > 3)
        {
            var item = template.replace('btn_[REPLACESTR]_txt.png', 'menu.png');
            item = common.ReplaceAll(item, '[REPLACESTR]', 'more');
            funchtml = funchtml + item;
            count++;
            break;
        }
    }
    
    j$('#callfunctions_layout').html(funchtml);

// attach click listeners   conference,transfer,numpad,mute,hold,speaker
    j$('#btn_callforward').off('click');
    j$('#btn_callforward').on('click', function(event) { CallfunctionsOnclick('callforward'); });
    
    j$('#btn_conference').off('click');
    j$('#btn_conference').on('click', function(event) { CallfunctionsOnclick('conference'); });

    j$('#btn_transfer').off('click');
    j$('#btn_transfer').on('click', function(event) { CallfunctionsOnclick('transfer'); });

    j$('#btn_numpad').off('click');
    j$('#btn_numpad').on('click', function(event) { CallfunctionsOnclick('numpad'); });

    j$('#btn_mute').off('click');
    j$('#btn_mute').on('click', function(event) { CallfunctionsOnclick('mute'); });

    j$('#btn_hold').off('click');
    j$('#btn_hold').on('click', function(event) { CallfunctionsOnclick('hold'); });

    j$('#btn_speaker').off('click');
    j$('#btn_speaker').on('click', function(event) { CallfunctionsOnclick('speaker'); });

    j$('#btn_chat').off('click');
    j$('#btn_chat').on('click', function(event) { CallfunctionsOnclick('chat'); });
    
    j$('#btn_video').off('click');
    j$('#btn_video').on('click', function(event) { CallfunctionsOnclick('video'); });
    
    j$('#btn_more').off('click');
    j$('#btn_more').on('click', function(event) { CallfunctionsOnclick('more'); });



    j$('#btn_callforward').attr('title', stringres.get('hint_callforward'));
    j$('#btn_conference').attr('title', stringres.get('hint_conference'));
    j$('#btn_transfer').attr('title', stringres.get('hint_transfer'));
    j$('#btn_numpad').attr('title', stringres.get('hint_dialpad_dtmf'));
    j$('#btn_mute').attr('title', stringres.get('hint_mute'));
    j$('#btn_hold').attr('title', stringres.get('hint_hold'));
    j$('#btn_speaker').attr('title', stringres.get('hint_speaker'));
    j$('#btn_chat').attr('title', stringres.get('hint_message'));
    j$('#btn_video').attr('title', stringres.get('menu_videorecall'));
    j$('#btn_more').attr('title', stringres.get('hint_more'));
    
// set mute,hold status accordingly
    var cline = webphone_api.getline();
    var mutestate = common.GetMuteState(cline);
    var holdstate = common.GetHoldState(cline);

    var mstatus = document.getElementById('mute_status');
    if (!common.isNull(mstatus))
    {
        if (mutestate === true)
        {
            if ( j$(mstatus).hasClass('callfunc_status_on') === false )
            {
                j$(mstatus).addClass('callfunc_status_on');
            }
        }else
        {
            if ( j$(mstatus).hasClass('callfunc_status_on') )
            {
                j$(mstatus).removeClass('callfunc_status_on');
            }
        }
    }
    var hstatus = document.getElementById('hold_status');
    if (!common.isNull(hstatus))
    {
        if (holdstate === true)
        {
            if ( j$(hstatus).hasClass('callfunc_status_on') === false )
            {
                j$(hstatus).addClass('callfunc_status_on');
            }
        }else
        {
            if ( j$(hstatus).hasClass('callfunc_status_on') )
            {
                j$(hstatus).removeClass('callfunc_status_on');
            }
        }
    }

//--    }

// calculate width in percent
    if (count === 0) { count = global.nrOfCallfunctionsToDisplay; }
    var btnWidth = common.GetDeviceWidth() - ( (count - 1) * j$(".callfunc_spacer").width() );
    
    btnWidth = Math.round(btnWidth * 100.0 / common.GetDeviceWidth() * 100) / 100;
    btnWidth = Math.floor(btnWidth / count * 100.0) / 100;

    btnWidth = btnWidth - 0.1;

    j$(".callfunc_btn_container").width(btnWidth + '%');
    
    } catch(err) { common.PutToDebugLogException(2, "_call: AddCallFunctions", err); }
}

var CLICK_CONFERENCE = 0;
var CLICK_TRANSFER = 1;
var CLICK_MUTE = 2;
var CLICK_HOLD = 3;
var CLICK_SPEAKER = 4;
var CLICK_NUMAPD = 5;
var CLICK_BLUETOOTH = 6;
var CLICK_CHAT = 7;
var CLICK_VIDEO = 8;
var CLICK_CALLFORWARD = 9;

function CFUsageClickCount(which) // count the number of clicks on call function buttons
{
    var lastoop = 0;
    var resetVals = false; // reset values (divide by 2 if any value is > 20 or < -20)
    try{ //-- conference, transfer, mute, hold, speaker, numpad, bluetooth, chat, video

    var usageStr = common.GetParameter('callfunctionsbtnusage');
    lastoop = 1;
    if (common.isNull(usageStr) || usageStr.length < 1) return;
    lastoop = 2;
    var usage = usageStr.split(',');
    lastoop = 3;
    var usageInt = [];
    lastoop = 4;
    for (var i = 0; i < usage.length; i++)
    {
            usageInt[i] = common.StrToInt(usage[i]);
            if (usageInt[i] > 20 || usageInt[i] < -20) resetVals = true;
    }
    lastoop = 5;
    switch(which)
    {
            case CLICK_CONFERENCE:	usageInt[CLICK_CONFERENCE]++; return;
            case CLICK_TRANSFER:	usageInt[CLICK_TRANSFER]++; return;
            case CLICK_MUTE:		usageInt[CLICK_MUTE]++; return;
            case CLICK_HOLD:		usageInt[CLICK_HOLD]++; return;
            case CLICK_SPEAKER:		usageInt[CLICK_SPEAKER]++; return;
            case CLICK_NUMAPD:		usageInt[CLICK_NUMAPD]++; return;
            case CLICK_BLUETOOTH:	usageInt[CLICK_BLUETOOTH]++; return;
            case CLICK_CHAT:		usageInt[CLICK_CHAT]++; return;
            case CLICK_VIDEO:		usageInt[CLICK_VIDEO]++; return;
    }

    if (resetVals)
    {
            for (var i = 0; i < usageInt.length; i++)
            {
                usageInt[i] = Math.floor(usageInt[i] / 2);
            }
    }

    lastoop = 6;
//--     callforward, conference, transfer, mute, hold, speaker, numpad, bluetooth, chat, video
    usageStr = usageInt[CLICK_CALLFORWARD] + ',' +usageInt[CLICK_CONFERENCE] + ',' + usageInt[CLICK_TRANSFER] + ',' + usageInt[CLICK_MUTE] + ',' + usageInt[CLICK_HOLD] +',' + usageInt[CLICK_SPEAKER] + ','
            + usageInt[CLICK_NUMAPD] + ',' + usageInt[CLICK_BLUETOOTH] + ',' + usageInt[CLICK_CHAT] + ',' + usageInt[CLICK_VIDEO];
    lastoop = 7;
    common.SaveParameter('callfunctionsbtnusage', usageStr);
    lastoop = 8;
    } catch(err) { common.PutToDebugLogException(2, '_call: CFUsageClickCount (' + lastoop.toString() + ')', err); }
}

function CallfunctionsOnclick (func) // call page -> call function button on click
{
    try{
    if (common.isNull(func)) { return; }
    
    common.PutToDebugLog(4, 'EVENT, _call CallfunctionsOnclick func = ' + func);
    
    if (func === 'mute')
    {
        var success = Mute();
        if (!success) { return; }
    }
    
    if (func === 'hold')
    {
        var success = Hold();
        if (!success) { return; }
    }
    
    
    var status = document.getElementById(func + '_status');

    if (!common.isNull(status) && func !== 'conference' && func !== 'transfer' && func !== 'chat' && func !== 'more' && func !== 'callforward')
    {
        if ( j$(status).hasClass('callfunc_status_on') )
        {
            j$(status).removeClass('callfunc_status_on');
        }else
        {
            j$(status).addClass('callfunc_status_on');
        }
    }
    
    if (func === 'callforward')     { Callforward(''); }
    if (func === 'conference')      { Conference(''); }
    if (func === 'transfer')        { Transfer(''); }
    if (func === 'speaker')         { Speaker(); }
    if (func === 'numpad')          { Numpad(); }
    if (func === 'chat')            { Chat(); }
    if (func === 'video')           { VideoRecall(); }
    if (func === 'more')            { j$('#btn_call_menu').click(); }

    } catch(err) { common.PutToDebugLogException(2, '_call: CallfunctionsOnclick', err); }
}

var audiowasvisible = false;
var volumewasvisible = false;
function Numpad() // show / hide numpad for DTMF
{
    try{
    if (j$('#numpad').css('display') === 'none')
    {
        if (j$('#audiodevice_container').is(':visible')) { audiowasvisible = true; } else { audiowasvisible = false; }
        if (j$('#volumecontrols').is(':visible')) { volumewasvisible = true; } else { volumewasvisible = false; }

        document.getElementById('numpad_number').innerHTML = '&nbsp;';
        j$('#contact_image').hide();
        j$('#audiodevice_container').hide();
        j$('#volumecontrols').hide();
        j$('#numpad').show();
        MeasureCall();
    }else
    {
        j$('#numpad').hide();
        j$('#contact_image').show();
        if (audiowasvisible) { j$('#audiodevice_container').show(); }
        if (volumewasvisible) { j$('#volumecontrols').show(); }
        MeasureCall();
    }
    
    } catch(err) { common.PutToDebugLogException(2, '_call: Numpad', err); }
}

function Conference(phoneNr) // popup
{
    try{
    common.PutToDebugLog(1, 'EVENT, ' + stringres.get('initiate_conference'));

    if (common.getuseengine() === global.ENGINE_WEBRTC
            && common.GetConfigBool('usingmizuserver', false) === false && common.IsMizuWebRTCEmbeddedServer() === false && common.IsMizuWebRTCGateway() === false)
    {
        if (common.GetParameter('conf_engineswitcheoffered') !== 'true')
        {
            var ep_webrtc = common.StrToInt(common.GetParameter2('enginepriority_webrtc'));
            var ep_java = common.StrToInt(common.GetParameter2('enginepriority_java'));
            var ep_ns = common.StrToInt(common.GetParameter2('enginepriority_ns'));

            if (ep_ns > 0 && ep_webrtc - ep_ns < 3 && common.CanIUseService() === true)
            {
                common.EngineSwitchConference('ns', phoneNr, Conference);
                return;
            }
            if (ep_java > 0 && ep_webrtc - ep_java < 3 && common.CanIUseApplet() === true)
            {
                common.EngineSwitchConference('java', phoneNr, Conference);
                return;
            }
        }else
        {
            common.PutToDebugLog(2, 'ERROR, _call Conference engine switch already offered: ' + common.getuseengine());
        }
    }
    
    if (global.isdebugversionakos)
    {
        common.GetContacts(function () {});
    }
    
// if is multiline, then try to find another active call and connect them whitout asking for number
    if (global.acallcount > 1)
    {
        for (var i = 0; i < global.ep.length; i++)
        {
            if (common.isNull(global.ep[i]) || global.ep[common.EP_FLAGDEL] === 'true') { continue; }

            var ln = common.StrToInt(global.ep[i][common.EP_LINE]);

            if (ln !== global.aline) // we found another active call
            {
                var nr = global.ep[i][common.EP_DESTNR];
                if (!common.isNull(nr) && nr.length > 0)
                {
                    if(common.IsMizuServer() === true && IsConferenceRoom() === true) // means it's conference rooms, so just send invites via chat
                    {
                        // get currently active call number
                        var ep = common.GetEndpoint(global.aline, '', '', false);
                        common.SendConferenceInvites(nr, ep[common.EP_DESTNR]);

                        common.PutToDebugLog(2, 'EVENT, _call: Conference, multiline conference: ' + nr + ' AND ' + ep[common.EP_DESTNR]);
                    }else
                    {
                        webphone_api.conference(nr, true);
                        common.SaveParameter('last_conference_number', nr);
                        common.PutToDebugLog(2, 'EVENT, _call: Conference, multiline conference: ' + nr);
                    }

                    return;
                }
            }
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
'<div id="conference_popup" data-role="popup" class="ui-content messagePopup" data-overlay-theme="a" data-theme="a" style="max-width:' + popupWidth + 'px;">' +

    '<div data-role="header" data-theme="b">' +
        '<a href="javascript:;" data-role="button" data-icon="delete" data-iconpos="notext" class="ui-btn-right closePopup">Close</a>' +
        '<h1 class="adialog_title">' + stringres.get('conference_title') + '</h1>' +
    '</div>' +
    '<div role="main" class="ui-content adialog_content adialog_btn_nexttoinput">' +
        '<span>' + stringres.get('phone_nr') + '</span>' +
        '<div style="clear: both;"><!--//--></div>' +
        '<input type="text" id="conference_input" name="setting_item" data-theme="a" autocapitalize="off"/>' +
        '<button id="btn_pickct" class="btn_nexttoinput ui-btn ui-btn-corner-all ui-btn-b noshadow"><img src="' + common.GetElementSource() + 'images/' + btnimage + '"></button>' +
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
            j$('#btn_pickct').off('click');
            popupafterclose();
        }
    });
    
//-- listen for enter onclick, and click OK button
//-- no need for this, because it reloads the page
//--    j$( "#conference_popup" ).keypress(function( event )
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

    var textBox = document.getElementById('conference_input');
    
    var lastConferenceNumber = common.GetParameter("last_conference_number");

    if (!common.isNull(lastConferenceNumber) && lastConferenceNumber.length > 1)
    {
        textBox.value = common.Trim(lastConferenceNumber);
    }
    
    if (!common.isNull(phoneNr) && phoneNr.length > 0) { textBox.value = phoneNr; }

    if (!common.isNull(textBox)) { textBox.focus(); } // setting cursor to text input

    j$('#adialog_positive').on('click', function (event)
    {
        var textboxval = common.Trim(textBox.value);
        
        common.PutToDebugLog(5,'EVENT, call Conference ok onclick (' + common.getuseengine() + '): ' + textboxval);
        
        if (!common.isNull(textboxval) && textboxval.length > 0)
        {
//--  if Webrtc engine: on conference clicked, hangup call and initiate conference room call
//--		if clicked again, don't initiate conf call again
            if (common.IsWindowsSoftphone() === false && common.getuseengine() === global.ENGINE_WEBRTC)
            {
                if (global.isconfroom_call === true)
                {
                    //common.InitiateConference(textboxval);
                    common.SendConferenceInvites(textboxval, callnumber);
                }else
                {
                    global.isconfroom_call = true;
                    webphone_api.conference(textboxval,true);
                    common.SaveParameter('last_conference_number', textboxval);
                }
                return;
            }else
            {
                webphone_api.conference(textboxval,true);
                common.SaveParameter('last_conference_number', textboxval);
            }
        }else
        {
            common.ShowToast(stringres.get('err_msg_4'));
            j$.mobile.back();
        }
    });

    j$('#adialog_negative').on('click', function (event)
    {
        ;
    });

    j$('#btn_pickct').on('click', function (event)
    {
        j$.mobile.activePage.find(".messagePopup").popup("close");

        j$( '#conference_popup' ).on( 'popupafterclose', function( event )
        {
            j$( '#conference_popup' ).off( 'popupafterclose' );

            common.PickContact(Conference);
        });
    });
    
    CFUsageClickCount(CLICK_CONFERENCE);

    } catch(err) { common.PutToDebugLogException(2, '_call: Conference', err); }
}

function Callforward(phoneNr) // popup
{
    try{
    common.PutToDebugLog(1, 'EVENT, ' + stringres.get('initiate_callforward'));
    
    var popupWidth = common.GetDeviceWidth();
    if ( !common.isNull(popupWidth) && common.IsNumber(popupWidth) && popupWidth > 100 )
    {
        popupWidth = Math.floor(popupWidth / 1.2);
    }else
    {
        popupWidth = 220;
    }
    var btnimage = 'btn_callforward_txt.png';
    
    var template = '' +
'<div id="callforward_popup" data-role="popup" class="ui-content messagePopup" data-overlay-theme="a" data-theme="a" style="max-width:' + popupWidth + 'px;">' +

    '<div data-role="header" data-theme="b">' +
        '<a href="javascript:;" data-role="button" data-icon="delete" data-iconpos="notext" class="ui-btn-right closePopup">Close</a>' +
        '<h1 class="adialog_title">' + stringres.get('callforward_title') + '</h1>' +
    '</div>' +
    '<div role="main" class="ui-content adialog_content adialog_btn_nexttoinput">' +
        '<span>' + stringres.get('phone_nr') + '</span>' +
        '<div style="clear: both;"><!--//--></div>' +
        '<input type="text" id="callforward_input" name="setting_item" data-theme="a" autocapitalize="off"/>' +
        '<button id="btn_pickct" class="btn_nexttoinput ui-btn ui-btn-corner-all ui-btn-b noshadow"><img src="' + common.GetElementSource() + 'images/' + btnimage + '"></button>' +
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
            j$('#btn_pickct').off('click');
            popupafterclose();
        }
    });
    
//-- listen for enter onclick, and click OK button
//-- no need for this, because it reloads the page
//--    j$( "#callforward_popup" ).keypress(function( event )
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

    var textBox = document.getElementById('callforward_input');

//--    var lastTransferNumber = common.GetParameter("last_transfer_number");
//--    if (!common.isNull(lastTransferNumber) && lastTransferNumber.length > 1)
//--    {
//--        textBox.value = common.Trim(lastTransferNumber);
//--    }
    
    if (!common.isNull(phoneNr) && phoneNr.length > 0) { textBox.value = phoneNr; }

    if (!common.isNull(textBox)) { textBox.focus(); } // setting cursor to text input

    j$('#adialog_positive').on('click', function (event)
    {
        common.PutToDebugLog(5,'EVENT, call Callforward ok onclick');
        var textboxval = common.Trim(textBox.value);
        
        if (!common.isNull(textboxval) && textboxval.length > 0)
        {
            webphone_api.forward(textboxval);

            j$('#acceptreject_layout').hide();
            j$('#hangup_layout').show();
//--            common.SaveParameter('last_transfer_number', textboxval);
        }else
        {
            common.ShowToast(stringres.get('err_msg_4'));
//--            j$.mobile.back();
        }
    });

    j$('#adialog_negative').on('click', function (event)
    {
        ;
    });

    j$('#btn_pickct').on('click', function (event)
    {
        j$.mobile.activePage.find(".messagePopup").popup("close");

        j$( '#callforward_popup' ).on( 'popupafterclose', function( event )
        {
            j$( '#callforward_popup' ).off( 'popupafterclose' );

            common.PickContact(Callforward);
        });
    });
    
    CFUsageClickCount(CLICK_CALLFORWARD);

    } catch(err) { common.PutToDebugLogException(2, '_call: Callforward', err); }
}

function Transfer(phoneNr) // popup
{
    try{
    common.PutToDebugLog(1, 'EVENT, ' + stringres.get('initiate_call_transfer'));
    

//--    if (common.getuseengine() === global.ENGINE_WEBRTC && common.GetParameter('transf_engineswitcheoffered') !== 'true')
//--    {
//--        var ep_webrtc = common.StrToInt(common.GetParameter2('enginepriority_webrtc'));
//--        var ep_java = common.StrToInt(common.GetParameter2('enginepriority_java'));
//--        var ep_ns = common.StrToInt(common.GetParameter2('enginepriority_ns'));
        
//--        if (ep_ns > 0 && ep_webrtc - ep_ns < 3 && common.CanIUseService() === true)
//--        {
//--            common.EngineSwitchTransfer('ns', phoneNr, Transfer);
//--            return;
//--        }
//--        if (ep_java > 0 && ep_webrtc - ep_java < 3 && common.CanIUseApplet() === true)
//--        {
//--            common.EngineSwitchConference('java', phoneNr, Transfer);
//--            return;
//--        }
//--    }

    if (global.isdebugversionakos)
    {
        common.GetContacts(function () {});
    }
    

//-- if is multiline, then try to find another active call and connect them whitout asking for number
//--    if (common.IsMultiline() === 1)
//--    {
//--        for (var i = 0; i < global.ep.length; i++)
//--        {
//--            if (common.isNull(global.ep[i]) || global.ep[common.EP_FLAGDEL] === 'true') { continue; }

//--            var ln = common.StrToInt(global.ep[i][common.EP_LINE]);

//--            if (ln !== global.aline) // we found another active call
//--            {
//--                var nr = global.ep[i][common.EP_DESTNR];
//--                if (!common.isNull(nr) && nr.length > 0 && nr !== callnumber)
//--                {
//--                    webphone_api.transfer(nr, global.aline);
//--                    common.SaveParameter('last_transfer_number', nr);
//--                    common.PutToDebugLog(2, 'EVENT, _call: Transfer, multiline transfer: ' + nr);

//--                    return;
//--                }
//--            }
//--        }
//--    }

    
    var popupWidth = common.GetDeviceWidth();
    if ( !common.isNull(popupWidth) && common.IsNumber(popupWidth) && popupWidth > 100 )
    {
        popupWidth = Math.floor(popupWidth / 1.2);
    }else
    {
        popupWidth = 220;
    }
    var btnimage = 'btn_transfer_txt.png';
    
    var template = '' +
'<div id="transfer_popup" data-role="popup" class="ui-content messagePopup" data-overlay-theme="a" data-theme="a" style="max-width:' + popupWidth + 'px;">' +

    '<div data-role="header" data-theme="b">' +
        '<a href="javascript:;" data-role="button" data-icon="delete" data-iconpos="notext" class="ui-btn-right closePopup">Close</a>' +
        '<h1 class="adialog_title">' + stringres.get('transfer_title') + '</h1>' +
    '</div>' +
    '<div role="main" class="ui-content adialog_content adialog_btn_nexttoinput">' +
        '<span>' + stringres.get('phone_nr') + '</span>' +
        '<div style="clear: both;"><!--//--></div>' +
        '<input type="text" id="transfer_input" name="setting_item" data-theme="a" autocapitalize="off"/>' +
        '<button id="btn_pickct" class="btn_nexttoinput ui-btn ui-btn-corner-all ui-btn-b noshadow"><img src="' + common.GetElementSource() + 'images/' + btnimage + '"></button>' +
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
            j$('#btn_pickct').off('click');
            popupafterclose();
        }
    });
    
//-- listen for enter onclick, and click OK button
//-- no need for this, because it reloads the page
//--    j$( "#transfer_popup" ).keypress(function( event )
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

    var textBox = document.getElementById('transfer_input');
    
    var lastTransferNumber = common.GetParameter("last_transfer_number");

    if (!common.isNull(lastTransferNumber) && lastTransferNumber.length > 1)
    {
        textBox.value = common.Trim(lastTransferNumber);
    }
    
    if (!common.isNull(phoneNr) && phoneNr.length > 0) { textBox.value = phoneNr; }

    if (!common.isNull(textBox)) { textBox.focus(); } // setting cursor to text input

    j$('#adialog_positive').on('click', function (event)
    {
        common.PutToDebugLog(5,'EVENT, call Transfer ok onclick');

        var textboxval = common.Trim(textBox.value);
        
        if (!common.isNull(textboxval) && textboxval.length > 0)
        {
            webphone_api.transfer(textboxval, 2);
            common.SaveParameter('last_transfer_number', textboxval);
        }else
        {
            common.ShowToast(stringres.get('err_msg_4'));
            j$.mobile.back();
        }
    });

    j$('#adialog_negative').on('click', function (event)
    {
        ;
    });

    j$('#btn_pickct').on('click', function (event)
    {
        j$.mobile.activePage.find(".messagePopup").popup("close");

        j$( '#transfer_popup' ).on( 'popupafterclose', function( event )
        {
            j$( '#transfer_popup' ).off( 'popupafterclose' );

            common.PickContact(Transfer);
        });
    });
    
    CFUsageClickCount(CLICK_TRANSFER);

    } catch(err) { common.PutToDebugLogException(2, '_call: Transfer', err); }
}

function Mute() // :boolean   handle Mute - onClick 
{
    try{
//--    boolean muteSuccess = sipStack.API_Mute(-1, phoneService.muteState);
    var muteDirection = common.GetParameterInt('defmute', 2);

    var mstate = !common.GetMuteState(-1);
    var muteSuccess = webphone_api.mute(mstate, muteDirection, -1);

    CFUsageClickCount(CLICK_MUTE);

//--    if (muteSuccess)
//--    {
        return true;
//--    }
    } catch(err) { common.PutToDebugLogException(2, '_call: Mute', err); }
    return false;
}

function Hold() // :boolean  handle Hold - onClick 
{
    try{
    var hstate = !common.GetHoldState(-1);
    var holdSuccess = webphone_api.hold(hstate, -1);

    CFUsageClickCount(CLICK_HOLD);

    if (holdSuccess)
    {
        return true;
    }
    
    } catch(err) { common.PutToDebugLogException(2, '_call: Hold', err); }
    return false;
}

function Speaker()
{
    try{
    alert('speaker on / off');
    
    } catch(err) { common.PutToDebugLogException(2, '_call: Hold', err); }
}

function Chat()
{
    try{
    if (hanguponchat === true)
    {
        HangupCall();
    }
    
    common.StartMsg(callnumber, '', '_call');
    CFUsageClickCount(CLICK_CHAT);
    
    } catch(err) { common.PutToDebugLogException(2, '_call: Chat', err); }
}

var MENUITEM_CALL_IGNORE = '#menuitem_call_ignore';
var MENUITEM_CALL_CALLFORWARD = '#menuitem_call_callforward';
var MENUITEM_CALL_CONFERENCE = '#menuitem_call_conference';
var MENUITEM_CALL_TRANSFER = '#menuitem_call_transfer';
var MENUITEM_CALL_NUMPAD = '#menuitem_call_numpad';
var MENUITEM_CALL_MUTE = '#menuitem_call_mute';
var MENUITEM_CALL_HOLD = '#menuitem_call_hold';
var MENUITEM_CALL_SPEAKER = '#menuitem_call_speaker';
var MENUITEM_CALL_MESSAGE = '#menuitem_call_message';
var MENUITEM_VOLUME_CONTROLS = '#menuitem_volume_controls';
var MENUITEM_AUDIO_DEVICE = '#menuitem_audio_device';
var MENUITEM_RECALL_VIDEO = '#menuitem_recall_video';
var MENUITEM_CALLPARK = '#menuitem_callpark';
var MENUITEM_MULTILINECALL = '#menuitem_multilinecall';
var MENUITEM_ACCEPT_HOLD = '#menuitem_accepthold';
var MENUITEM_ACCEPT_END = '#menuitem_acceptend';
var MENUITEM_EXIT_VIDEOMODE = '#menuitem_exit_videomode';
var MENUITEM_CALL_AUDIO_ONLY = '#menuitem_call_audio_only';
//--var MENUITEM_SCREENSHARE = '#menuitem_screenshare';

function CreateOptionsMenu (menuId) // adding items to menu, called from html
{
    try{
//-- remove data transition for windows softphone, because it's slow
    if (common.GetParameter('devicetype') === common.DEVICE_WIN_SOFTPHONE())
    {
        j$( "#btn_call_menu" ).removeAttr('data-transition');
    }

    if ( common.isNull(menuId) || menuId.lenght < 1 ) { common.PutToDebugLog(2, "ERROR, _call: CreateOptionsMenu menuid null"); return; }

    if (j$(menuId).length <= 0) { common.PutToDebugLog(2, "ERROR, _call: CreateOptionsMenu can't get reference to Menu"); return; }

    if (menuId.charAt(0) !== '#') { menuId = '#' + menuId; }
    
    j$(menuId).html('');
    var featureset = common.GetParameterInt('featureset', 10);
    
    var availableFunc = common.GetAvailableCallfunctions();
    if ( common.isNull(availableFunc) || availableFunc.length < 3)
    {
        common.PutToDebugLog(2, 'ERROR, _call: CreateOptionsMenu no available callfunctions (1)');
        return;
    }
    
    if (availableFunc.indexOf('numpad') >= 0)
    {
        var numpadTitle = stringres.get('menu_numpad');
        if (j$('#numpad').is(':visible')) { numpadTitle = stringres.get('menu_numpad_hide'); }
        j$(menuId).append( '<li id="' + MENUITEM_CALL_NUMPAD + '"><a data-rel="back">' + numpadTitle + '</a></li>' ).listview('refresh');
    }
    
    if (featureset > 5)
    {
        if (availableFunc.indexOf('conference') >= 0 &&
            (
                common.IsWindowsSoftphone() === true
                || common.getuseengine() === global.ENGINE_WEBPHONE
                || common.getuseengine() === global.ENGINE_SERVICE
                || (common.getuseengine() === global.ENGINE_WEBRTC && (common.GetConfigBool('usingmizuserver', false) === true || common.IsMizuWebRTCEmbeddedServer() === true || common.IsMizuWebRTCGateway() === true || common.CanIUseService() === true))
            ))
        
//--        if (availableFunc.indexOf('conference') >= 0 || (common.IsMizuServer() === true && IsConferenceRoom() === true)) // for conference rooms
        {
            j$(menuId).append( '<li id="' + MENUITEM_CALL_CONFERENCE + '"><a data-rel="back">' + stringres.get('menu_conference') + '</a></li>' ).listview('refresh');
        }
    }
    
    if (availableFunc.indexOf('chat') >= 0)
    {
        j$(menuId).append( '<li id="' + MENUITEM_CALL_MESSAGE + '"><a data-rel="back">' + stringres.get('menu_message') + '</a></li>' ).listview('refresh');
    }
    
    if (featureset > 0 && availableFunc.indexOf('transfer') >= 0 && global.checkIfCallActive === true)
    {
        j$(menuId).append( '<li id="' + MENUITEM_CALL_TRANSFER + '"><a data-rel="back">' + stringres.get('menu_transfer') + '</a></li>' ).listview('refresh');
    }
    
    if (featureset > 0 && availableFunc.indexOf('mute') >= 0 && global.checkIfCallActive === true)
    {
        j$(menuId).append( '<li id="' + MENUITEM_CALL_MUTE + '"><a data-rel="back">' + stringres.get('menu_mute') + '</a></li>' ).listview('refresh');
    }
    if (featureset > 0 && availableFunc.indexOf('hold') >= 0 && global.checkIfCallActive === true)
    {
        j$(menuId).append( '<li id="' + MENUITEM_CALL_HOLD + '"><a data-rel="back">' + stringres.get('menu_hold') + '</a></li>' ).listview('refresh');
    }
    
    if (common.CanIUseVideo() === true)
    {
        j$(menuId).append( '<li id="' + MENUITEM_RECALL_VIDEO + '"><a data-rel="back">' + stringres.get('menu_videorecall') + '</a></li>' ).listview('refresh');
    }
    
    if (common.IsMultiline() === 1)
    {
        j$(menuId).append( '<li id="' + MENUITEM_MULTILINECALL + '"><a data-rel="back">' + stringres.get('menu_multilinecall') + '</a></li>' ).listview('refresh');
    }
    
    if (featureset > 5 && availableFunc.indexOf('callforward') >= 0 && showcallfwd === true)
    {
        j$(menuId).append( '<li id="' + MENUITEM_CALL_CALLFORWARD + '"><a data-rel="back">' + stringres.get('menu_callforward') + '</a></li>' ).listview('refresh');
    }
    
    if (featureset > 0 && availableFunc.indexOf('speaker') >= 0)
    {
        j$(menuId).append( '<li id="' + MENUITEM_CALL_SPEAKER + '"><a data-rel="back">' + stringres.get('menu_speaker') + '</a></li>' ).listview('refresh');
    }
    
    if (showignore === true)
    {
        j$(menuId).append( '<li id="' + MENUITEM_CALL_IGNORE + '"><a data-rel="back">' + stringres.get('menu_ignore') + '</a></li>' ).listview('refresh');
    }
    
    if (common.IsWindowsSoftphone() === true && callmode > 0)
    {
        if (common.GetParameterInt('softphonevideomode', 0) === 1)
        {
            j$(menuId).append( '<li id="' + MENUITEM_EXIT_VIDEOMODE + '"><a data-rel="back">' + stringres.get('menu_exit_videomode') + '</a></li>' ).listview('refresh');
        }
    }
    
    if (j$('#mline_layout').is(':visible'))
    {
        j$(menuId).append( '<li id="' + MENUITEM_ACCEPT_HOLD + '"><a data-rel="back">' + stringres.get('menu_accept_hold') + '</a></li>' ).listview('refresh');
        j$(menuId).append( '<li id="' + MENUITEM_ACCEPT_END + '"><a data-rel="back">' + stringres.get('menu_accept_end') + '</a></li>' ).listview('refresh');
    }

    var cpnr = common.GetConfig('callparknumber');
    if (common.isNull(cpnr) || cpnr.length < 0) { cpnr = common.GetParameter2('callparknumber'); }
    if (cpnr.length > 0)
    {
        j$(menuId).append( '<li id="' + MENUITEM_CALLPARK + '"><a data-rel="back">' + stringres.get('menu_callpark') + '</a></li>' ).listview('refresh');
    }
    
// show Volume controls/Hide Volume  in menu, if not always displayed
    if (common.GetParameterBool('displayvolumecontrols', false) === false)
    {
        var voltitle = '';
        if (j$('#volumecontrols').is(':visible'))
        {
            voltitle = stringres.get('menu_volumehide');
        }else
        {
            voltitle = stringres.get('menu_volumeshow');
        }
        
        j$(menuId).append( '<li id="' + MENUITEM_VOLUME_CONTROLS + '"><a data-rel="back">' + voltitle + '</a></li>' ).listview('refresh');
    }
    
//-- show Audio device/Hide Audio device  in menu, if not always displayed
//--    if (common.GetParameterBool('displayaudiodevice', false) === false)
//--    {
//--        var audiotitle = '';
//--        if (j$('#audiodevice_container').is(':visible'))
//--        {
//--            audiotitle = stringres.get('menu_audiodevicehide');
//--        }else
//--        {
//--            audiotitle = stringres.get('menu_audiodeviceshow');
//--        }
        
//--        j$(menuId).append( '<li id="' + MENUITEM_AUDIO_DEVICE + '"><a data-rel="back">' + audiotitle + '</a></li>' ).listview('refresh');
//--    }

    if ((common.getuseengine() === global.ENGINE_WEBRTC && (common.GetBrowser() === 'Firefox' || common.GetBrowser() === 'Chrome'))
        || common.GetParameter('devicetype') === common.DEVICE_WIN_SOFTPHONE() || common.getuseengine() === global.ENGINE_SERVICE || common.getuseengine() === global.ENGINE_WEBPHONE)
    {
        j$(menuId).append( '<li id="' + MENUITEM_AUDIO_DEVICE + '"><a data-rel="back">' + stringres.get('menu_audiodeviceshow') + '</a></li>' ).listview('refresh');
    }

    if (callmode === 1)
    {
        j$(menuId).append( '<li id="' + MENUITEM_CALL_AUDIO_ONLY + '"><a data-rel="back">' + stringres.get('menu_mute_video') + '</a></li>' ).listview('refresh');
    }
    
    return true;

    } catch(err) { common.PutToDebugLogException(2, "_call: CreateOptionsMenu", err); }
    
    return false;
}

function MenuItemSelected(itemid)
{
    try{
    if (common.isNull(itemid) || itemid.length < 1) { return; }
    
    j$( '#call_menu' ).on( 'popupafterclose', function( event )
    {
        j$( '#call_menu' ).off( 'popupafterclose' );
        
        switch (itemid)
        {
            case MENUITEM_CALL_IGNORE:
                webphone_api.ignore();
                break;
            case MENUITEM_CALL_CALLFORWARD:
                CallfunctionsOnclick('callforward');
                break;
            case MENUITEM_CALL_CONFERENCE:
                CallfunctionsOnclick('conference');
                break;
            case MENUITEM_CALL_TRANSFER:
                CallfunctionsOnclick('transfer');
                break;
            case MENUITEM_CALL_NUMPAD:
                CallfunctionsOnclick('numpad');
                break;
            case MENUITEM_CALL_MUTE:
                CallfunctionsOnclick('mute');
                break;
            case MENUITEM_CALL_HOLD:
                CallfunctionsOnclick('hold');
                break;
            case MENUITEM_CALL_SPEAKER:
                CallfunctionsOnclick('speaker');
                break;
            case MENUITEM_CALL_MESSAGE:
                CallfunctionsOnclick('chat');
                break;
            case MENUITEM_VOLUME_CONTROLS:
                ShowHideVolumeControls();
                break;
            case MENUITEM_AUDIO_DEVICE:
                //ShowHideAudioDevice();
                webphone_api.devicepopup();
                break;
            case MENUITEM_RECALL_VIDEO:
                VideoRecall();
                break;
            case MENUITEM_CALLPARK:
                CallPark();
                break;
            case MENUITEM_MULTILINECALL:
                NewMultilineCall();
                break;
            case MENUITEM_ACCEPT_HOLD:
                AcceptHold(true);
                break;
            case MENUITEM_ACCEPT_END:
                AcceptEnd(true);
                break;
            case MENUITEM_EXIT_VIDEOMODE:
                common.ExitVideoMode('USER,call Menu');
                break;
        }
    });
    } catch(err) { common.PutToDebugLogException(2, "_call: MenuItemSelected", err); }
}

function VideoRecall()
{
    try{
    if (callmode > 0)
    {
        common.ShowToast('This is already a video call');
        common.PutToDebugLog(2, 'WARNING, _call VideoRecall this is already a video call');
        return;
    }
    common.PutToDebugLog(2, 'EVENT, _call USER VideoRecall');
    global.dontshow_closecall = true;
    HangupCall();
    setTimeout(function ()
    {
        webphone_api.videocall(callnumber);
        global.dontshow_closecall = false;
    }, 250);

    CFUsageClickCount(CLICK_VIDEO);

    } catch(err) { common.PutToDebugLogException(2, "_call: VideoRecall", err); }
}

function CallPark()
{
    try{
    var cpnr = common.GetConfig('callparknumber');
    if (common.isNull(cpnr) || cpnr.length < 0) { cpnr = common.GetParameter2('callparknumber'); }
    
    common.PutToDebugLog(3, 'EVENT, call CallPark onclick: ' + cpnr);

    if (cpnr.length < 1) { return; }

    webphone_api.dtmf(cpnr);

    } catch(err) { common.PutToDebugLogException(2, "_call: CallPark", err); }
}

function ShowHideVolumeControls()
{
    try{
    if (j$('#volumecontrols').is(':visible'))
    {
        j$('#volumecontrols').hide();
    }else
    {
        j$('#volumecontrols').show();
    }

    MeasureCall();

    } catch(err) { common.PutToDebugLogException(2, "_call: ShowHideVolumeControls", err); }
}

function ShowHideAudioDevice()
{
    try{
    if (j$('#audiodevice_container').is(':visible'))
    {
        j$('#audiodevice_container').hide();
    }else
    {
        j$('#audiodevice_container').show();
    }

    MeasureCall();

    } catch(err) { common.PutToDebugLogException(2, "_call: ShowHideVolumeControls", err); }
}

function IsConferenceRoom() // check if called number is a conference room number
{
    try{
    if (common.isNull(callnumber) || callnumber.length < 0) { return false; }
    var cfr = common.GetParameter('received_confrooms');
    var list = cfr.split(',');
    for (var i = 0; i < list.length; i++)
    {
        if (list[i] === callnumber)
        {
            return true;
        }
    }

    } catch(err) { common.PutToDebugLogException(2, "_call: ShowHideVolumeControls", err); }
    return false;
}

function onStop(event)
{
    try{
    common.PutToDebugLog(4, "EVENT, _call: onStop");
    global.isCallStarted = false;
    
    global.hangupPressedCount = 0;
    j$('#call_duration').html('');
    global.rating = '';
    
    global.closeCallAtivity = false;
    plhandler.Cfin();
    
    global.lastRingEvenet = '';
    global.isconfroom_call = false;
    callmode = 0;
    lastBtns = '';
    
    j$('#page_call_additional_info').html('');
    j$('#page_call_peer_details').html('');
    
    j$('#callfunctions_layout').html('');
    j$("#ml_buttons").html('');
    global.acallcount = 0;
    j$('#numpad_number').html('');

    
//--    j$("#btn_hangup").off('click');
//--    j$("#btn_accept").off('click');
//--    j$("#btn_reject").off('click');
    
//--    j$('#btn_conference').off('click');
//--    j$('#btn_transfer').off('click');
//--    j$('#btn_numpad').off('click');
//--    j$('#btn_mute').off('click');
//--    j$('#btn_hold').off('click');
//--    j$('#btn_speaker').off('click');

    } catch(err) { common.PutToDebugLogException(2, "_call: onStop", err); }
}

function onDestroy (event){}// deprecated by onstop

var callpage_public = {

    LineCliked: LineCliked,
    OnNewIncomingCall: OnNewIncomingCall,
    UpdateLineButtons: UpdateLineButtons
};
window.callpage_public = callpage_public;

// public members and methods
return {
    onCreate: onCreate,
    onStart: onStart,
    onStop: onStop,
    onDestroy: onDestroy,
    CloseCall: CloseCall,
    OnCallerHangup: OnCallerHangup,
    AcceptCall: AcceptCall,
    RejectCall: RejectCall
};
})();