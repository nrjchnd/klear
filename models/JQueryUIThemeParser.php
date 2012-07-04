<?php

class Klear_Model_JQueryUIThemeParser
{

    const filename = 'jquery-ui-themes.yaml';

    protected $_config;
    protected $_baseUrl;

    protected $_localConfig = false;
    protected $_localBaseUrl = false;

    public function setLocalExtraConfigFile($localFile)
    {
        $localFile = APPLICATION_PATH
                   . DIRECTORY_SEPARATOR
                   .  $localFile;

        if (file_exists($localFile)) {

            $this->_localConfig = new Zend_Config_Yaml($localFile, APPLICATION_ENV);
            $this->_localBaseUrl = $this->_localConfig->baseurl;
        }
    }

    public function init()
    {
        $front = Zend_Controller_Front::getInstance();

        $cssAssetsPath = array(
            $front->getModuleDirectory('klear'),
            'assets',
            'css',
            self::filename
        );
        $cssAssetsPath = implode(DIRECTORY_SEPARATOR, $cssAssetsPath);

        if (!file_exists($cssAssetsPath)) {

            Throw new Zend_Exception("No existe el fichero de configuración de estilos (jQuery UI)");
        }

        $this->_config = new Zend_Config_Yaml($cssAssetsPath, APPLICATION_ENV);
        $this->_baseUrl = $this->_config->baseurl;
    }


    public function getPathForTheme($theme)
    {
        foreach ($this->_config->themes as $_theme) {

            if ($theme === trim($_theme)) {

                return str_replace('%theme%', $_theme, $this->_baseUrl);
            }
        }

        if (false !== $this->_localConfig) {

            foreach ($this->_localConfig->themes as $_theme) {

                if ($theme === trim($_theme)) {
                    return str_replace('%theme%', $_theme, $this->_localBaseUrl);
                }
            }
        }

        Throw new Zend_Exception("No existe una configuración de estilos válida");
    }
}