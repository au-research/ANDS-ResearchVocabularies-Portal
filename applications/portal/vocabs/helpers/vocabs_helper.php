<?php
use Ramsey\Uuid\Uuid;

/**
 * Return the vocabulary configuration for a particular config
 * @author Minh Duc Nguyen <minh.nguyen@ands.org.au>
 * @param $item
 * @return bool
 */
function get_vocab_config($item)
{
    $vocab_configs = get_config_item('vocab_config');
    if (isset($vocab_configs[$item])) {
        return $vocab_configs[$item];
    } else {
        return false;
    }
}

/**
 * Return the vocabulary uploaded url for a file
 * Used in the view page to generate the file URL
 * @author Minh Duc Nguyen <minh.nguyen@ands.org.au>
 * @param $name
 * @return string
 */
function vocab_uploaded_url($name)
{
    $path = get_vocab_config('upload_path') . $name;
    return $path;
}

/**
 * Logging functionality for vocabs. This function
 * logs to the per-date files in engine/logs/vocab,
 * e.g., engine/logs/vocab/log-vocab-2019-01-15.php.
 * @author Minh Duc Nguyen <minh.nguyen@ands.org.au>
 * @param $message
 * @param string $type
 */
function vocab_log($message, $type = 'info')
{
    $CI =& get_instance();

    //check if the logging class is loaded, if not, load it
    if (!class_exists('Logging')) {
        $CI->load->library('logging');
    } else {
        $CI->load->library('logging');
    }

    try {
        $CI->logging->add_logger(
            array(
                'type' => 'file',
                // 'type' => 'database',
                // 'database_group' => 'vocabs',
                // 'table' => 'log',
                'level' => 'INFO',
                'name' => 'vocab',
                'format' => '[date:{date}] {message}',
                'file_path' => 'vocab'
            )
        );
        $logger = $CI->logging->get_logger('vocab');
        switch ($type) {
            case 'info':
                $logger->info($message);
                break;
            case 'debug':
                $logger->debug($message);
                break;
            case 'warning':
                $logger->warning($message);
                break;
            case 'error':
                $logger->error($message);
                break;
            case 'critical':
                $logger->critical($message);
                break;
        }
    } catch (Exception $e) {
        // throw new Exception($e);
    } catch (LoggingException $e) {
        // throw new Exception($e);
    }
}

/**
 * Vocab log array
 * @author Minh Duc Nguyen <minh.nguyen@ands.org.au>
 * @param array $terms
 * @param string $type
 */
function vocab_log_terms($terms = array(), $type = 'info')
{
    $CI =& get_instance();
    $msg = '';

    if (!isset($terms['ip'])) {
        $terms['ip'] = $CI->input->ip_address();
    }
    if (!isset($terms['user_agent'])) {
        $terms['user_agent'] = $CI->input->user_agent();
    }

    //check if user is logged in, then record the current user
    if ($CI->user->isLoggedIn()) {
        $terms['username'] = $CI->user->name();
        $terms['userid'] = $CI->user->localIdentifier();
    }

    foreach ($terms as $key => $term) {
        if (!is_array($key) && !is_array($term)) {
            $msg .= '[' . $key . ':' . $term . ']';
        }
    }

    vocab_log($msg, $type);
}

/**
 * Get the language description, given a language tag.
 * @param $term The langauge tag.
 * @param $languageDetailsList The list of language details provided
 *        with the vocabulary.
 * @return string
 */
function readable_lang($term, $languageDetailsList)
{
    foreach ($languageDetailsList as $languageDetails) {
        if ($languageDetails->getTag() == $term) {
            return $languageDetails->getDescription();
        }
    }
    return 'Unknown';
}

/**
 * Helper method to format access point type
 * @author Minh Duc Nguyen <minh.nguyen@ands.org.au>
 * @param $term
 * @return string
 */
function vocab_readable($term)
{
    $match = strtolower($term);
    switch ($match) {
        case 'webpage':
            return 'Online';
            break;
        case 'apisparql':
            return 'API/SPARQL';
            break;
        case 'file':
            return 'Direct Download';
            break;
        default:
            return $term;
            break;
    }
}

/**
 * Analytic logging functionality for vocabs. This function logs to
 * the logstash-format portal.log file in logs,
 * i.e., logs/portal.log.
 * @param mixed[] $event The event to be logged.
 */
function vocabs_portal_log($event)
{
    // Add a UUID, for Elasticsearch's use.  Adding the UUID could be
    // done inside the monolog() function ... but then we'd get (more)
    // out of sync with the RDA-flavoured ANDSLogging library.
    $event['uuid'] = Uuid::uuid4()->toString();
    monolog($event, 'portal', 'info', true);
}
