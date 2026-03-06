@echo off
setlocal
set BASE=http://localhost:3845/assets
set OUT=public\assets\figma
mkdir %OUT% 2>nul

echo Downloading assets from Figma MCP server...

curl -sf "%BASE%/41e2f8b763e39a3e0d837fdd744c3979bc39abd2.png" -o "%OUT%\hero_frame.png"
curl -sf "%BASE%/c067604bd1b512887a1c751e390ef5b38fddcb66.png" -o "%OUT%\hero_frame_left.png"
curl -sf "%BASE%/603bbdd2b122db06f4d9c01dc4c427a91982772c.png" -o "%OUT%\hero_frame_right.png"
curl -sf "%BASE%/0205c05cd6dc51f064a83c05817bd63918766742.png" -o "%OUT%\hero_banner.png"
curl -sf "%BASE%/3bdd7cda49631f7cc452051d2be1196490796488.png" -o "%OUT%\hero_headline.png"
curl -sf "%BASE%/3c0ba6a7d8605446c26ccd1a1ee04baed2769bf7.png" -o "%OUT%\logo_clouddc.png"
curl -sf "%BASE%/e1015557291099dc5a7245d216c39232c2fef06c.svg" -o "%OUT%\logo_mobifone.svg"
curl -sf "%BASE%/16243dd18bc11b27c603534ec933d1f1b76e57d7.svg" -o "%OUT%\user_icon.svg"
curl -sf "%BASE%/538219d9a26e416ad9b3351309fad4259183e6be.png" -o "%OUT%\usp_tech.png"
curl -sf "%BASE%/3a63b0d40c697e926bfd30a241fe1c98f42cd88b.png" -o "%OUT%\usp_security.png"
curl -sf "%BASE%/d24a36ecc441086abbc991a7ea3f94b36744a465.png" -o "%OUT%\usp_quality.png"
curl -sf "%BASE%/a4f00c10ffcf2177eb1129690a2e072114e1eb82.png" -o "%OUT%\usp_support.png"
curl -sf "%BASE%/8def8ea53787a716c80db28403e3ae270f7f2960.png" -o "%OUT%\why_video.png"
curl -sf "%BASE%/97187834535578fd89ef96f48dc329dcfa34f81b.png" -o "%OUT%\service_card_bg.png"
curl -sf "%BASE%/1344633f4f2bff1b2866c12db14b676b49093826.png" -o "%OUT%\menu_card1.png"
curl -sf "%BASE%/91273f7790f7f62d800be572747fa54424ec6a1d.png" -o "%OUT%\menu_card2.png"
curl -sf "%BASE%/ad68edf1190f6012bb4bcb1fee643354deb227d1.png" -o "%OUT%\menu_card3.png"
curl -sf "%BASE%/aba31d77daf9e6c5445037ae3e39654d2efed836.png" -o "%OUT%\popup_banner.png"
curl -sf "%BASE%/377eeb9bfab0c8125b771330c1f9dc2768ed9a44.png" -o "%OUT%\solution_cloud.png"
curl -sf "%BASE%/3715d735c0d656cc32c7db6b9473237f382436b7.png" -o "%OUT%\solution_database.png"
curl -sf "%BASE%/bf74ef395b23dd05439a730942b3834e9e52e104.png" -o "%OUT%\solution_hosting.png"
curl -sf "%BASE%/868854527f6d6a8f91a7877c8de0a634f7950807.png" -o "%OUT%\brand_video.png"
curl -sf "%BASE%/2588ba8a285864f6aaa8a4a17bdf33ca8c961336.svg" -o "%OUT%\success_vector.svg"
curl -sf "%BASE%/d7707a8636034e0fab3f86fe8a7d0d32d1320c9f.svg" -o "%OUT%\success_group.svg"
curl -sf "%BASE%/46d1678f3fe39c7fc3aad2a829891fa79d31c4f3.svg" -o "%OUT%\success_group1.svg"
curl -sf "%BASE%/b77a114503173f96508326eece655dcf65201044.png" -o "%OUT%\cert_1.png"
curl -sf "%BASE%/b483cb96fe6a80b181ad5bc72d2f90e61c8c131b.png" -o "%OUT%\cert_2.png"
curl -sf "%BASE%/3cec065449cb0f18235d31ca94ac3e07cc2ac359.png" -o "%OUT%\cert_3.png"
curl -sf "%BASE%/dbb7f938cd8c9caec30b21831aff5366a11a82ee.png" -o "%OUT%\cert_4.png"
curl -sf "%BASE%/ab7c6d6e1ef8e1aa4578700aff69716f44743ead.png" -o "%OUT%\cert_5.png"
curl -sf "%BASE%/8cc8baeec7773739d5894f07036ab1a87724b276.png" -o "%OUT%\news_featured.png"
curl -sf "%BASE%/ac33c03e65545cb6efe2b0441e01b330ece96614.png" -o "%OUT%\news_article1.png"
curl -sf "%BASE%/0d92606b998e6869612f9403a66b3beee12dbce8.png" -o "%OUT%\news_article3.png"
curl -sf "%BASE%/c03481b8bfb749fc539bc0587c163a8d34350616.png" -o "%OUT%\partner_1.png"
curl -sf "%BASE%/d0f0f2db5b5496878e199bed9027a54a7759a7d5.png" -o "%OUT%\partner_2.png"
curl -sf "%BASE%/7e07e3c51e6399c78625feaa42ac12b62920860e.png" -o "%OUT%\partner_3.png"
curl -sf "%BASE%/7bce30819f8699a8c80f2e738b8fc8dbb88027ea.png" -o "%OUT%\partner_4.png"
curl -sf "%BASE%/2821e7443f4ab86787915ba2271a19ad8bb1a020.png" -o "%OUT%\partner_5.png"
curl -sf "%BASE%/e132b1700cc364c6fe7b2241e75a45f5ec7da84b.png" -o "%OUT%\partner_6.png"
curl -sf "%BASE%/3fdb2843476669f0f9328b6dca5518f51ef97cae.png" -o "%OUT%\partner_7.png"
curl -sf "%BASE%/5932dc68dd59d93c8d1a5768470c48356eab7ebb.png" -o "%OUT%\partner_8.png"
curl -sf "%BASE%/6ea26ef7bd6ebaa8b913b170e7bcdecf5e57d01d.png" -o "%OUT%\client_1.png"
curl -sf "%BASE%/b4cb1672967302641283d594515d3fc410c6ae9d.png" -o "%OUT%\client_2.png"
curl -sf "%BASE%/d3d7e34672c19ed2bdbdc869ab510c16ee5ee95a.png" -o "%OUT%\client_3.png"
curl -sf "%BASE%/8cafbf6fdbdc37fa5b86a70b07de7bb63ee97154.png" -o "%OUT%\client_4.png"
curl -sf "%BASE%/7a71477e503558824fbd2e018eeb607cbc183a89.png" -o "%OUT%\client_5.png"
curl -sf "%BASE%/a5b150da69232433f9a77e42a55030f85cfdad64.png" -o "%OUT%\client_6.png"
curl -sf "%BASE%/42c72bfa09e57f368911e0162cc67c8535130dc5.png" -o "%OUT%\client_7.png"
curl -sf "%BASE%/d7aaa72abd3a8d5bc5851bb958ac436fa8405e9b.png" -o "%OUT%\client_8.png"
curl -sf "%BASE%/9eac8b4bdae0340e258983820b26a92df73bbf8e.png" -o "%OUT%\footer_cert_ministry.png"
curl -sf "%BASE%/3057939e651198a222b39ec0e756ad9535dfb042.png" -o "%OUT%\footer_cert_1.png"
curl -sf "%BASE%/708d69494e78fab595bcbb192e10fe9cff747e67.png" -o "%OUT%\footer_cert_2.png"
curl -sf "%BASE%/373838ffdc5231e48510d6055860f39fc0b808c1.png" -o "%OUT%\footer_cert_3.png"
curl -sf "%BASE%/d294f4453a85aa33981ea53d519e9626dff59b08.png" -o "%OUT%\footer_cert_4.png"
curl -sf "%BASE%/fa661faad513c49fd10e4bc22bb94cd2191e441c.png" -o "%OUT%\footer_cert_5.png"
curl -sf "%BASE%/a66f764a1fc5512376130d64dcdaca13649ff4c6.png" -o "%OUT%\social_1.png"
curl -sf "%BASE%/ba27a79de50bc4182ab9253ec42f88f967ffdd11.png" -o "%OUT%\social_2.png"
curl -sf "%BASE%/a886ad45f95827236dd395e388a50c98e290cd61.png" -o "%OUT%\social_3.png"
curl -sf "%BASE%/a74d7483796e2e1c72f73a2aa90a3daee8f7108d.png" -o "%OUT%\social_4.png"
curl -sf "%BASE%/0754160420b1379f754ef68a3a51c4d0f1dc80b9.png" -o "%OUT%\social_5.png"

echo.
echo Done! Checking downloaded files...
dir %OUT% /B /O:N
echo.
echo Now update home.component.ts: change BASE to '/assets/figma'
