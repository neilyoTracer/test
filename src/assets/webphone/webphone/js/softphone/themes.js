//--define([], function() // list and configurations of themes
var themes = (function ()
{
var themelist = {

theme_0: // Default
{
    bgcolorheader: '#1d1d1d',
    bgcolor: '#1d1d1d',
    scrollbarcolor: '#3c3c3c',
    listbgcolor: '#2a2a2a',
    listitembgcolor: '#333333',
    buttoncolor: '#333333',
    buttonhover: '#373737',
    buttonbordercolor: '#1f1f1f',
    tabcolor: '#333333',
    tabselectedcolor: '#22aadd',
    bgdialpadnrfield: '#001a22',
    bgdialpadbtn: '#001a22',
    bgdialpadfooter: '#001a22',
    fontctheme: '#31b6e7',
    fontcwhite: '#ffffff',
    fontcstatus: '#ffffff',
    fontfamily: 'sans-serif'
},

theme_1: // Light Purple
{
    bgcolorheader: '#4897D3',
    bgcolor: '#F1F1F1',
    scrollbarcolor: '#9C9B99',
    listbgcolor: '#F1F1F1',
    listitembgcolor: '#F1F1F1',
    buttoncolor: '#4897D3', 
    buttonhover: '#DEDCDA',
    buttonbordercolor: '#E6E6E6',
    tabcolor: '#4797D1',
    tabselectedcolor: '#6666CC',
    bgdialpadnrfield: '#F1F1F1',
    bgdialpadbtn: '#F1F1F1', //dialpad background
    bgdialpadfooter: '#F1F1F1',
    fontctheme: '#4897D3',
    fontcwhite: '#2B2B2B',
    fontcstatus: '#FFFFFF',
    fontfamily: 'sans-serif'
},

theme_2: // Light Green
{
    bgcolorheader: '#efefef',
    bgcolor: '#ffffff',
    scrollbarcolor: '#cccccc',
    listbgcolor: '#ffffff',
    listitembgcolor: '#ffffff',
    buttoncolor: '#dfdfdf',
    buttonhover: '#d1d1d1',
    buttonbordercolor: '#bcbcbc',
    tabcolor: '#333333',
    tabselectedcolor: '#99c55a',
    bgdialpadnrfield: '#efefef',
    bgdialpadbtn: '#ffffff',
    bgdialpadfooter: '#d1d3d1',
    fontctheme: '#6dad12',
    fontcwhite: '#555755',
    fontcstatus: '#555755',
    fontfamily: 'sans-serif'
},

theme_3: // Light Orange
{
    bgcolorheader: '#333333',
    bgcolor: '#ff9900',
    scrollbarcolor: '#3c3c3c',
    listbgcolor: '#ffffff',
    listitembgcolor: '#ffffff',
    buttoncolor: '#dfdfdf',
    buttonhover: '#efefef',
    buttonbordercolor: '#333333',
    tabcolor: '#333333',
    tabselectedcolor: '#666666',
    bgdialpadnrfield: '#efefef',
    bgdialpadbtn: '#ffffff',
    bgdialpadfooter: '#ca602a',
    fontctheme: '#ff9900',
    fontcwhite: '#555755',
    fontcstatus: '#ff9900',
    fontfamily: 'sans-serif'
},

theme_4: // Light Blue
{
    bgcolorheader: '#c5cfea',
    bgcolor: '#ffffff',
    scrollbarcolor: '#d3d9f4', 
    listbgcolor: '#ffffff',
    listitembgcolor: '#ffffff',
    buttoncolor: '#c5cfea',
    buttonhover: '#f5f5ff',
    buttonbordercolor: '#ffffff',
    tabcolor: '#c5cfea',
    tabselectedcolor: '#8399ec',
    bgdialpadnrfield: '#ffffff',
    bgdialpadbtn: '#ffffff',
    bgdialpadfooter: '#c5cfea',
    fontctheme: '#101113',
    fontcwhite: '#101113',
    fontcstatus: '#101113',
    fontfamily: 'sans-serif'
},

theme_5: // Dark Red
{
    bgcolorheader: '#2e3238',
    bgcolor: '#3A414A',
    scrollbarcolor: '#292e34',
    listbgcolor: '#3A414A',
    listitembgcolor: '#3A414A',
    buttoncolor: '#000000',
    buttonhover: '#2e383e',
    buttonbordercolor: '#000000',
    tabcolor: '#2d2b2b',
    tabselectedcolor: '#000000',
    bgdialpadnrfield: '#3A414A',
    bgdialpadbtn: '#3A414A',
    bgdialpadfooter: '#3A414A',
    fontctheme: '#DD191D',
    fontcwhite: '#FF5555',
    fontcstatus: '#D7D9DB',
    fontfamily: 'sans-serif'
},

theme_6:// Yellow
{
    bgcolorheader: '#fae675',
    bgcolor: '#e8c55f',
    scrollbarcolor: '#d3b057',
    listbgcolor: '#e8c55f',
    listitembgcolor: '#fccd01',
    buttoncolor: '#f7e778',
    buttonhover: '#fae675',
    buttonbordercolor: '#988040',
    tabcolor: '#d3b057',
    tabselectedcolor: '#5d4b23',
    bgdialpadnrfield: '#ffffff',
    bgdialpadbtn: '#f1e1a8',
    bgdialpadfooter: '#916c27',
    fontctheme: '#5d4b23',
    fontcwhite: '#555755',
    fontcstatus: '#5d4b23',
    fontfamily: 'sans-serif'
},

theme_7: // Blue
{
    bgcolorheader: '#000000',
    bgcolor: '#3BBBF5',
    scrollbarcolor: '#2983AC',
    listbgcolor: '#3BBBF5',
    listitembgcolor: '#3BBBF5',
    buttoncolor: '#2AAAFF',
    buttonhover: '#25A5E0',
    buttonbordercolor: '#25A5E0',
    tabcolor: '#000000',
    tabselectedcolor: '#2AAAFF',
    bgdialpadnrfield: '#3BBBF5',
    bgdialpadbtn: '#3BBBF5', 
    bgdialpadfooter: '#3BBBF5',
    fontctheme: '#FFFFFF', // dialpad number color
    fontcwhite: '#000000',
    fontcstatus: '#FFFFFF',
    fontfamily: 'sans-serif'
},

theme_8: // Purple
{
    bgcolorheader: '#b80581',
    bgcolor: '#ffaef3',
    scrollbarcolor: '#bd27b2',
    listbgcolor: '#ffaef3',
    listitembgcolor: '#ffaef3',
    buttoncolor: '#d64fcd',
    buttonhover: '#fe8cfd',
    buttonbordercolor: '#811b73',
    tabcolor: '#333333',
    tabselectedcolor: '#bd27b2',
    bgdialpadnrfield: '#ff10fd',
    bgdialpadbtn: '#ffffff',
    bgdialpadfooter: '#9603661',
    fontctheme: '#ff37c3',
    fontcwhite: '#555755',
    fontcstatus: '#000000',
    fontfamily: 'sans-serif'
},

theme_9: // Turquoise
{
    bgcolorheader: '#00AAA0',
    bgcolor: '#00AAA0',
    scrollbarcolor: '#00625C',
    listbgcolor: '#00AAA0',
    listitembgcolor: '#00AAA0',
    buttoncolor: '#8ED2C9',
    buttonhover: '#009A91',
    buttonbordercolor: '#5ec1c3',
    tabcolor: '#00847C',
    tabselectedcolor: '#125D79',
    bgdialpadnrfield: '#00AAA0',
    bgdialpadbtn: '#00AAA0',
    bgdialpadfooter: '#00AAA0',
    fontctheme: '#125d79', 
    fontcwhite: '#ffffff',
    fontcstatus: '#ffffff',
    fontfamily: 'sans-serif'
},

theme_10: // Light Skin
{
    bgcolorheader: '#dddddd',
    bgcolor: '#f3eeee',
    scrollbarcolor: '#ffffff',
    listbgcolor: '#ffffff',
    listitembgcolor: '#f2eaea',
    buttoncolor: '#D6D4D4',
    buttonhover: '#F6F0F0',
    buttonbordercolor: '#cccccc',
    tabcolor: '#dddddd',
    tabselectedcolor: '#BEB9B9',
    bgdialpadnrfield: '#ffffff',
    bgdialpadbtn: '#FAFAFA',
    bgdialpadfooter: '#DDDDDD',
    fontctheme: '#BAB0B0',
    fontcwhite: '#ACA8A8',
    fontcstatus: '#ffffff',
    fontfamily: 'sans-serif'
},

theme_11: // Green Orange
{
    bgcolorheader: '#0B4245',
    bgcolor: '#ffffff',
    scrollbarcolor: '#115f63',
    listbgcolor: '#ffffff',
    listitembgcolor: '#f2eaea',
    buttoncolor: '#f7f7f7',
    buttonhover: '#F6F0F0',
    buttonbordercolor: '#e0e0e0',
    tabcolor: '#115F63',
    tabselectedcolor: '#ff9009',
    bgdialpadnrfield: '#ffffff',
    bgdialpadbtn: '#FAFAFA',
    bgdialpadfooter: '#4DB748',
    fontctheme: '#ff9009',
    fontcwhite: '#4DB748',
    fontcstatus: '#ffffff',
    fontfamily: 'sans-serif'
},

theme_14: //-- customized for Kokotalk
{
    bgcolorheader: '#000000',
    bgcolor: '#1d1d1d',
    scrollbarcolor: '#3c3c3c',
    listbgcolor: '#2a2a2a',
    listitembgcolor: '#333333',
    buttoncolor: '#333333',
    buttonhover: '#73a41c',
    buttonbordercolor: '#1f1f1f',
    tabcolor: '#333333',
    tabselectedcolor: '#73a41c',
    bgdialpadnrfield: '#97ca3d',
    bgdialpadbtn: '#97ca3d',
    bgdialpadfooter: '#97ca3d',
    fontctheme: '#97ca3d',
    fontcwhite: '#ffffff',
    fontcstatus: '#ffffff',
    fontfamily: 'sans-serif'
},

theme_15: //-- customized for Favafone
{
    bgcolorheader: '#1d1d1d',
    bgcolor: '#1d1d1d',
    scrollbarcolor: '#3c3c3c',
    listbgcolor: '#2a2a2a',
    listitembgcolor: '#333333',
    buttoncolor: '#39b54d',
    buttonhover: '#32a043',
    buttonbordercolor: '#1f1f1f',
    tabcolor: '#333333',
    tabselectedcolor: '#39b54d',
    bgdialpadnrfield: 'url(images/texture_bg_dial.png) repeat #001a22',
    bgdialpadbtn: 'url(images/texture_bg_dial.png) repeat #001a22',
    bgdialpadfooter: 'url(images/texture_bg_dial.png) repeat #001a22',
    fontctheme: '#71bf44',
    fontcwhite: '#ffffff',
    fontcstatus: '#ffffff',
    fontfamily: 'sans-serif'
},

theme_16: //-- customized for Voipcenter
{ 
    bgcolorheader: '#FF9900',
    bgcolor: '#ffffff',
    scrollbarcolor: '#008B8B', 
    listbgcolor: '#ffffff',
    listitembgcolor: '#ffffff',
    buttoncolor: '#FF9900',
    buttonhover: '#e6e6e6',
    buttonbordercolor: '#ffffff',
    tabcolor: '#008B8B',
    tabselectedcolor: '#FF9900',
    bgdialpadnrfield: '#ffffff',
    bgdialpadbtn: '#FF9900',
    bgdialpadfooter: '#008B8B',
    fontctheme: '#008B8B',
    fontcwhite: '#008B8B',
    fontcstatus: '#000000',
    fontfamily: 'sans-serif'
},

theme_18: //-- voipmuch
{
    bgcolorheader: '#2e3238',
    bgcolor: '#3A414A',
    scrollbarcolor: '#292e34',
    listbgcolor: '#3A414A',
    listitembgcolor: '#3A414A',
    buttoncolor: '#000000',
    buttonhover: '#2e383e',
    buttonbordercolor: '#000000',
    tabcolor: '#2d2b2b',
    tabselectedcolor: '#000000',
    bgdialpadnrfield: '#3A414A',
    bgdialpadbtn: '#3A414A',
    bgdialpadfooter: '#3A414A',
    fontctheme: '#B14E48',
    fontcwhite: '#FF5555',
    fontcstatus: '#B14E48',
    fontfamily: 'sans-serif'
},

theme_19: //-- Labbay
{
    bgcolorheader: '#0076c0',
    bgcolor: '#ffffff',
    scrollbarcolor: '#0094da',
    listbgcolor: '#ffffff',
    listitembgcolor: '#ffffff',
    buttoncolor: '#0094da',
    buttonhover: '#0076c0',
    buttonbordercolor: '#000000',
    tabcolor: '#0094da',
    tabselectedcolor: '#fcb913',
    bgdialpadnrfield: '#ffffff',
    bgdialpadbtn: '#ffffff',
    bgdialpadfooter: '#fdb813',
    fontctheme: '#00a1e7',
    fontcwhite: '#fdba13',
    fontcstatus: '#ffffff',
    fontfamily: 'sans-serif'
},

};

var themes = {

gettheme: function (name)
{
    if (typeof (name) === 'undefined' || name === null) { return null; }

    name = name.toLowerCase();

    if (typeof (themelist[name]) === 'undefined' || themelist[name] === null)
    {
        return null;
    }

    return themelist[name];
}
};
return themes;
})();
window.themes = themes;