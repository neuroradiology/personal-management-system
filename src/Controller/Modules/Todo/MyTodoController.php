<?php

namespace App\Controller\Modules\Todo;

use App\Controller\Core\Application;
use App\Controller\Modules\Issues\MyIssuesController;
use App\Controller\Modules\ModulesController;
use App\Controller\System\ModuleController;
use App\DTO\EntityDataDto;
use App\Entity\Interfaces\Relational\RelatesToMyTodoInterface;
use App\Entity\Modules\Todo\MyTodo;
use App\Services\Core\Logger;
use Doctrine\DBAL\DBALException;
use Doctrine\ORM\NonUniqueResultException;
use Doctrine\ORM\OptimisticLockException;
use Doctrine\ORM\ORMException;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;

class MyTodoController extends AbstractController {

    /**
     * @var Application $app
     */
    private $app;

    /**
     * @var ModuleController $module_controller
     */
    private ModuleController $module_controller;

    /**
     * @var MyIssuesController $issues_controller
     */
    private MyIssuesController $issues_controller;

    public function __construct(Application $app, ModuleController $module_controller, MyIssuesController $issues_controller)
    {
        $this->app               = $app;
        $this->issues_controller = $issues_controller;
        $this->module_controller = $module_controller;
    }

    /**
     * Will return the
     * @param string $module_name
     * @return MyTodo[]
     */
    public function getTodoForModule(string $module_name): array
    {
        $entities = $this->app->repositories->myTodoRepository->getEntitiesForModuleName($module_name);
        return $entities;
    }

    /**
     * Will fetch all MyTodo entities depending on the:
     * - deleted
     * - completed
     * state
     *
     * @param bool $deleted
     * @return MyTodo[]
     */
    public function getAll(bool $deleted = false): array
    {
        $entities = $this->app->repositories->myTodoRepository->getAll($deleted);
        return $entities;
    }

    /**
     * Will fetch all MyTodo entities grouped by associated module depending on the:
     * - deleted
     * - completed
     * state
     * @param bool $deleted
     * @return array
     */
    public function getAllGroupedByModuleName(bool $deleted = false): array
    {
        $grouped_entities = [];
        $all_entities     = $this->getAll($deleted);

        foreach($all_entities as $entity)
        {
            $module_name                      = ( is_null($entity->getModule()) ? null : $entity->getModule()->getName()) ;
            $grouped_entities[$module_name][] = $entity;
        }

        return $grouped_entities;
    }

    /**
     * Will save entity state in db
     *
     * @param MyTodo $myTodo
     * @throws OptimisticLockException
     * @throws ORMException
     */
    public function save(MyTodo $myTodo): void
    {
        $this->app->repositories->myTodoRepository->save($myTodo);
    }

    /**
     * Will check if al elements in single todo are done
     *
     * @param int $todo_id
     * @return bool
     * @throws DBALException
     */
    public function areAllElementsDone(int $todo_id): bool
    {
        $are_elements_done = $this->app->repositories->myTodoRepository->areAllElementsDone($todo_id);
        return $are_elements_done;
    }

    /**
     * Will set relation with `todo` with given entity in module
     *
     * @param MyTodo $todo
     */
    public function setRelationForTodo(MyTodo $todo): void
    {
        $entity_id = $todo->getRelatedEntityId();
        $module    = $todo->getModule();

        if( empty($module) ){
            $this->app->logger->info("Not setting relation to myTodo as no related module was selected");
            return;
        }

        $module_name      = $module->getName();
        $entity_namespace = ModulesController::getEntityNamespaceForModuleName($module_name);

        if( empty($entity_id) ){
            $this->app->logger->info("Not setting relation to myTodo as no entity was give to relate with");
            return;
        }

        if( is_null($entity_namespace) ){
            $this->app->logger->warning("Cannot set relation to MyTodo as no entity was found for module name", [
                Logger::KEY_MODULE_NAME => $module_name,
                Logger::KEY_ID          => $entity_id,
            ]);
            return;
        }

        $entity = $this->getDoctrine()->getManager()->find($entity_namespace, $entity_id);

        if( !$entity instanceof RelatesToMyTodoInterface ){
            $this->app->logger->warning("Cannot set relation to MyTodo as this entity does not implements relation interface", [
                Logger::KEY_MODULE_NAME => $module_name,
                Logger::KEY_ID          => $entity_id,
            ]);
            return;
        }

        $entity->setTodo($todo);

        if( is_null($entity) ){
            $this->app->logger->warning("Cannot set relation to MyTodo as no entity namespace mapping is defined for given module name", [
                Logger::KEY_MODULE_NAME => $module_name,
                Logger::KEY_ID          => $entity_id,
            ]);
            return;
        }
    }

    /**
     * Will return one module entity for given name or null if no matching module with this name was found
     *
     * @param string $module_name
     * @param int $entity_id
     * @return MyTodo|null
     * @throws NonUniqueResultException
     */
    public function getTodoByModuleNameAndEntityId(string $module_name, int $entity_id): ?MyTodo
    {
        return $this->app->repositories->myTodoRepository->getTodoByModuleNameAndEntityId($module_name, $entity_id);
    }

    /**
     * Returns one entity for given id or null otherwise
     *
     * @param int $id
     * @return MyTodo|null
     */
    public function findOneById(int $id): ?MyTodo
    {
        return $this->app->repositories->myTodoRepository->findOneById($id);
    }

    /**
     * Will return all entities which can relate with `todo` for given modules
     * @return EntityDataDto[]
     */
    public function getAllRelatableEntitiesDataDtosForModulesNames(): array
    {
        $all_modules                          = $this->module_controller->getAllActive();
        $relatable_entities_for_modules_names = [];

        foreach( $all_modules as $module ){
            $module_name = $module->getName();

            switch( $module_name ){
                case ModulesController::MODULE_NAME_ISSUES:
                {
                    $all_not_deleted_issues = $this->issues_controller->findAllNotDeletedAndNotResolved();

                    foreach( $all_not_deleted_issues as $issue_entity ){
                        $entity_data_dto = new EntityDataDto();
                        $entity_data_dto->setId($issue_entity->getId());
                        $entity_data_dto->setName($issue_entity->getName());

                        if( !empty($issue_entity->getTodo()) ){
                            $entity_data_dto->setActive(false);;
                        }

                        $relatable_entities_for_modules_names[$module_name][] = $entity_data_dto;
                    }
                }
                break;
            }

        }

        return $relatable_entities_for_modules_names;
    }

}