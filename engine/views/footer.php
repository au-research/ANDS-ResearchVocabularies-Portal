<?php
/**
 * Core Template File (footer)
 *
 *
 * @author Minh Duc Nguyen <minh.nguyen@ands.org.au>
 * @see ands/
 * @package ands/
 *
 */
// Variable defaults
$js_lib = !isset($js_lib) ? array() : $js_lib;
$base_url = str_replace('/apps','/registry',base_url());
?>
<div id="page-footer" class="clearfix">&nbsp;
</div>





    <!-- Mustache Template that should be used everywhere-->
    <div id="error-template" class="hide">
        <div class="alert alert-error">{{{.}}}</div>
    </div>

    <!-- The javascripts Libraries
    ================================================== -->
    <!-- Placed at the end of the document so the pages load faster -->
    <script>
        localStorage.clear();
        var base_url = '<?php echo $base_url;?>';
        var portal_url = '<?php echo portal_url();?>';
        var apps_url = '<?php echo apps_url();?>';
        var api_url = '<?php echo api_url();?>';
        var real_base_url = "<?php echo $this->config->item('default_base_url');?>";
        var suffix = '<?php echo url_suffix();?>';
        var internal_api_key = 'api';
        var editor = '';

        var socket_url = '<?php echo $this->config->item('socket_url');?>';
        //urchin code
        <?php echo urchin_for($this->config->item('svc_urchin_id')); ?>
    </script>

    <script type="text/javascript" src="<?php echo$base_url;?>assets/js/arms.scripts.js"></script>

    <!-- Module-specific styles and scripts -->
    <?php if (isset($app_js_lib)): foreach($app_js_lib as $lib):?>
        <script src="<?php echo asset_url('js/lib/' . $lib);?>"></script>
    <?php endforeach; endif; ?>
    <?php if (isset($app_css_lib)): foreach($app_css_lib as $lib):?>
        <link rel="stylesheet" href="<?php echo asset_url('js/lib/'. $lib);?>"/>
    <?php endforeach; endif; ?>

    <?php foreach($js_lib as $lib):?>

        <?php if($lib=='googleapi'):?>
            <script type='text/javascript' src='https://www.google.com/jsapi'></script>
            <script type="text/javascript">
                localGoogle = google;
                google.load("visualization", "1", {packages:["corechart"]});
            </script>

        <?php elseif($lib=='datepicker'):?>
            <script type="text/javascript" src="<?php echo $base_url;?>assets/lib/bootstrap_datepicker/js/bootstrap-datepicker.js"></script>
            <link rel="stylesheet" type="text/css" href="<?php echo$base_url;?>assets/lib/bootstrap_datepicker/css/datepicker.css" />

        <?php elseif($lib=='ands_datepicker'):?>
            <script type="text/javascript" src="<?php echo apps_url('assets/datepicker_tz_widget/js/ands_datetimepicker.js');?>"></script>
            <link rel="stylesheet" type="text/css" href="<?php echo apps_url('assets/datepicker_tz_widget/css/ands_datetimepicker.css');?>" />

        <?php elseif($lib=='ands_datetimepicker_widget'):?>
            <link href="<?php echo apps_url('assets/datepicker_tz_widget/css/ands_datetimepicker.css');?>" rel="stylesheet" type="text/css">
            <script src="<?php echo apps_url('assets/datepicker_tz_widget/js/ands_datetimepicker.js');?>" type="text/javascript"></script>

        <?php elseif($lib=='prettyprint'):?>
            <script type="text/javascript" src="<?php echo$base_url;?>assets/lib/prettyprint/pretty.js"></script>
            <link rel="stylesheet" type="text/css" href="<?php echo$base_url;?>assets/lib/prettyprint/pretty.css" />

        <?php elseif($lib=='context_menu'):?>
            <script src="<?php echo asset_url('lib/bootstrap-contextmenu.js', 'base'); ?>" type="text/javascript"></script>

        <?php elseif($lib=='vocab_widget'):?>
            <link rel="stylesheet" type="text/css" href="<?php echo apps_url('assets/vocab_widget/css/vocab_widget_v2.css'); ?>">
            <script src="<?php echo apps_url('assets/vocab_widget/js/vocab_widget_v2.js'); ?>"></script>

        <?php elseif($lib=='select2'):?>
            <link href="<?php echo asset_url('lib/select2/select2.css', 'base');?>" rel="stylesheet" type="text/css">
            <link href="<?php echo asset_url('lib/select2/select2-bootstrap.css', 'base');?>" rel="stylesheet" type="text/css">
            <script src="<?php echo asset_url('lib/select2/select2.min.js', 'base');?>" type="text/javascript"></script>

        <?php elseif($lib=='angular'):?>
            <script type="text/javascript" src="<?php echo asset_url('lib/angular.min.js', 'base') ?>"></script>
            <script type="text/javascript" src="<?php echo asset_url('lib/angularmod/angular-slugify.js', 'base') ?>"></script>
            <script type="text/javascript" src="<?php echo asset_url('lib/angularmod/sortable.js', 'base') ?>"></script>
            <script type="text/javascript" src="<?php echo asset_url('lib/angularmod/tinymce.js', 'base') ?>"></script>
            <script type="text/javascript" src="<?php echo asset_url('lib/angularmod/angular-sanitize-1.0.1.js', 'base') ?>"></script>
            <script type="text/javascript" src="<?php echo asset_url('lib/angularmod/select2.js', 'base') ?>"></script>
            <script type="text/javascript" src="<?php echo asset_url('lib/angularmod/ui-bootstrap-tpls-0.6.0.min.js', 'base') ?>"></script>
            <script type="text/javascript" src="<?php echo asset_url('lib/angularmod/ui-utils.min.js', 'base') ?>"></script>
            <script type="text/javascript" src="<?php echo asset_url('lib/angularmod/angular.datatables.js', 'base') ?>"></script>
            <script type="text/javascript" src="<?php echo asset_url('lib/angularmod/portal-filters.js', 'base') ?>"></script>

        <?php elseif($lib=='angular129'): ?>
            <script type="text/javascript" src="<?php echo asset_url('lib/angular129.min.js', 'base') ?>"></script>
            <script type="text/javascript" src="<?php echo asset_url('lib/angular129-route.min.js', 'base') ?>"></script>
            <script type="text/javascript" src="<?php echo asset_url('lib/angular129-resource.min.js', 'base') ?>"></script>

        <?php elseif($lib=='xmlToJson'): ?>
            <script type="text/javascript" src="<?php echo asset_url('lib/xmlToJson.js', 'base') ?>"></script>


        <?php elseif($lib=='colorbox'):?>
            <link href="<?php echo asset_url('lib/colorbox/colorbox.css', 'base');?>" rel="stylesheet" type="text/css">
            <script src="<?php echo asset_url('lib/colorbox/jquery.colorbox-min.js', 'base');?>" type="text/javascript"></script>

        <?php elseif($lib=="socket.io"):?>
            <script src="https://cdn.socket.io/socket.io-1.4.5.js"></script>

        <?php endif; ?>

    <?php endforeach;?>


    <?php if (isset($scripts)): foreach($scripts as $script):?>
        <script src="<?php echo asset_url('js/' . $script);?>.js"></script>
    <?php endforeach; endif; ?>


	<!-- Bootstrap javascripts, need to be placed after all else -->
    <script src="<?php echo$base_url;?>assets/lib/twitter_bootstrap/js/bootstrap.js"></script>

  </body>
</html>
