<?php

class Klear_Bootstrap extends Zend_Application_Module_Bootstrap
{

    protected function _initJson()
    {
        // Hasta que se resuelve el tema de que Zend_config JSON_encodee bien....
        Zend_Json::$useBuiltinEncoderDecoder = false;
    }

    
    protected function _initMainConfig()
    {
        $config = $this->getOption('config');
        if (empty($config)) {
            $config = array();
        }
        
        if (!isset($config['file'])) {
            $config['file'] = APPLICATION_PATH . '/configs/klear/klear.yaml';
        }
        
        $this->setOptions(array('config'=>$config));

    }

    /**
     * Registramos los plugins necesarios para el correcto funcionamiento de Klear
     */
    protected function _initKlear()
    {
        $front = Zend_Controller_Front::getInstance();

        // Inicialización mínima para parsear la configuración
        // Zend_Auth Y Zend_Log
        $front->registerPlugin(new Klear_Plugin_InitAuthAndLog());
        
        // Arranque de la configuración principal
        $front->registerPlugin(new Klear_Plugin_Init());

        /**
         * Klear_Plugin_Translator
         */
        $front->registerPlugin(new Klear_Plugin_Translator());

    }

    protected function _initModuleRoutes()
    {
        $frontController = Zend_Controller_Front::getInstance();
        $router = $frontController->getRouter();

        $router->addRoute(
            'klearDispatch',
            new Zend_Controller_Router_Route(
                'klear/dispatch/:file/*',
                array(
                    'controller' => 'index',
                    'action' => 'dispatch',
                    'module' => 'klear'
                )
            )
        );
    }

    protected function _initAssetRoutes()
    {
        $frontController = Zend_Controller_Front::getInstance();
        $router = $frontController->getRouter();

        $router->addRoute(
            'klearScripts',
            new Zend_Controller_Router_Route_Regex(
                '(default|klear[^/]*)/js/(.*)$',
                array(
                    'controller' => 'assets',
                    'action' => 'js',
                    'module' => 'klear'
                ),
                array(
                    2 => 'file',
                    1 => 'moduleName'
                )
            )
        );

        $router->addRoute(
            'klearCss',
            new Zend_Controller_Router_Route_Regex(
                '(default|klear[^/]*)/css/(.*)$',
                array(
                    'controller' => 'assets',
                    'action' => 'css',
                    'module' => 'klear'
                ),
                array(
                    2 => 'file',
                    1 => 'moduleName'
                )
            )
        );

        $router->addRoute(
            'klearCssExtended',
            new Zend_Controller_Router_Route_Regex(
                '(default|klear[^/]*)/css-extended/(.*)/(.*)$',
                array(
                    'controller' => 'assets',
                    'action' => 'css-extended',
                    'module' => 'klear'
                ),
                array(
                    3 => 'file',
                    2 => 'plugin',
                    1 => 'moduleName'
                )
            )
        );

        /*
         * TODO: Preparar la expresión regular para que soporte más tipos de imágenes
         */
        $router->addRoute(
            'klearCssImages',
            new Zend_Controller_Router_Route_Regex(
                '(default|klear[^/]*)/css/(.*\.png)$',
                array(
                    'controller' => 'assets',
                    'action' => 'css-image',
                    'module' => 'klear'
                ),
                array(
                    2 => 'file',
                    1 => 'moduleName'
                )
            )
        );

        $router->addRoute(
            'klearImages',
            new Zend_Controller_Router_Route_Regex(
                '(default|klear[^/]*)/images/(.*)$',
                array(
                    'controller' => 'assets',
                    'action' => 'image',
                    'module' => 'klear'
                ),
                array(
                    2 => 'file',
                    1 => 'moduleName'
                )
            )
        );

        $router->addRoute(
            'klearBinaryAssets',
            new Zend_Controller_Router_Route_Regex(
                '(default|klear[^/]*)/bin/(.*)$',
                array(
                    'controller' => 'assets',
                    'action' => 'bin',
                    'module' => 'klear'
                ),
                array(
                    2 => 'file',
                    1 => 'moduleName'
                )
            )
        );

        $router->addRoute(
            'klearTranslations',
            new Zend_Controller_Router_Route_Regex(
                '(default|klear[^/]*)/js/translation/(.*)$',
                array(
                    'controller' => 'assets',
                    'action' => 'js-translation',
                    'module' => 'klear'
                ),
                array(
                    2 => 'file',
                    1 => 'moduleName'
                )
            )
        );
    }

    protected function _initAutoload()
    {
        $autoloader = new Zend_Application_Module_Autoloader(
            array(
                'namespace' => 'Klear',
                'basePath'  => __DIR__,
            )
        );

        $autoloader->addResourceType('actionhelpers', 'controllers/helpers/', 'Controller_Helper');
        $autoloader->addResourceType('adapters', 'adapters/auth/', 'Auth_Adapter');
        $autoloader->addResourceType('exceptions', 'exceptions/', 'Exception');

        Zend_Controller_Action_HelperBroker::addPath(
            __DIR__ . '/controllers/helpers',
            'Klear_Controller_Helper_'
        );

        return $autoloader;
    }
}
