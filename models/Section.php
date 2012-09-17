<?php

/**
 * Clase factory de todos los objetos a partir de klear[config]
* @author jabi
*
*/
class Klear_Model_Section  implements \IteratorAggregate
{

    protected $_name;

    protected $_description;

    protected $_menu = null;

    protected $_subsections;

    protected $_skip = array();


    protected $_default = false;

    public function getIterator()
    {
        return new \ArrayIterator($this->_subsections);
    }

    public function setName($name)
    {
        $this->_name = $name;
        return $this;
    }

    public function setParentMenu($menu)
    {
        $this->_menu = $menu;
        return $this;
    }
    /*
     * skip subsections
     */
    public function setDataToSkip($skip)
    {
        $this->_skip = $skip;
        return $this;
    }

    public function setData(Zend_Config $data)
    {

        $config = new Klear_Model_ConfigParser();
        $config->setConfig($data);
        $this->_name = $config->getRequiredProperty("title");
        $this->_description = $config->getProperty("description");

        $this->_class = $config->getProperty("class");
        $this->_default = (bool)$config->getProperty("default");

        if (!isset($data->submenus)) return;

        foreach ($data->submenus as $file => $sectionData) {
            if (in_array($file, $this->_skip)) continue;
            $subsection = new Klear_Model_SubSection;

            $subsection
                ->setParentMenu($this->_menu)
                ->setMainFile($file)
                ->setData($sectionData);

            $this->_subsections[] = $subsection;
        }
    }

    public function getName()
    {
        return $this->_name;
    }

    public function getDescription()
    {
        return $this->_description;
    }
}
