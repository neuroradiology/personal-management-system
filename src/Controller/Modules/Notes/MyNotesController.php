<?php

namespace App\Controller\Modules\Notes;

use App\Controller\Modules\ModulesController;
use App\Controller\System\LockedResourceController;
use App\Controller\Core\Application;
use App\Entity\Modules\Notes\MyNotes;
use App\Entity\System\LockedResource;
use Doctrine\DBAL\Exception;
use Doctrine\DBAL\Statement;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;

class MyNotesController extends AbstractController {

    const KEY_CATEGORY_ID   = 'category_id';
    const KEY_CATEGORY_NAME = "category_name";

    /**
     * @var Application
     */
    private $app;

    /**
     * @var LockedResourceController $locked_resource_controller
     */
    private $locked_resource_controller;

    public function __construct(Application $app, LockedResourceController $locked_resource_controller) {
        $this->app = $app;
        $this->locked_resource_controller = $locked_resource_controller;
    }

    /**
     * Checks is the whole notes family has any active notes at all
     *
     * @param string $checked_category_id
     * @param Statement|null $is_allowed_to_see_resource_stmt
     * @param null $have_categories_notes_stmt
     * @return bool
     * @throws Exception
     * @throws \Doctrine\DBAL\Driver\Exception
     */
    public function hasCategoryFamilyVisibleNotes(string $checked_category_id, Statement $is_allowed_to_see_resource_stmt = null, $have_categories_notes_stmt = null): bool
    {
        if( is_null($have_categories_notes_stmt) ){
            $have_categories_notes_stmt = $this->app->repositories->myNotesCategoriesRepository->buildHaveCategoriesNotesStatement();
        }


        # 1. Some notes might just be empty, but if they have children then it cannot be hidden if some child has active note
        $has_category_family_active_note = false;
        $categories_ids                  = [$checked_category_id];

        while( !$has_category_family_active_note ){


                // it can be that the whole category itself is blocked, not only few notes inside
                foreach($categories_ids as $idx => $category_id){
                    if( !$this->locked_resource_controller->isAllowedToSeeResource($category_id, LockedResource::TYPE_ENTITY, ModulesController::MODULE_ENTITY_NOTES_CATEGORY, false, $is_allowed_to_see_resource_stmt) ){
                        unset($categories_ids[$idx]);
                    }
                }

                $have_categories_notes = $this->app->repositories->myNotesCategoriesRepository->executeHaveCategoriesNotesStatement($have_categories_notes_stmt, $categories_ids);

                if( $have_categories_notes ){

                    $notes = $this->app->repositories->myNotesRepository->getNotesByCategoriesIds($categories_ids);

                    # 2. Check lock and make sure that there are some notes visible
                    foreach( $notes as $index => $note ){
                        $note_id = $note->getId();
                        if( !$this->locked_resource_controller->isAllowedToSeeResource($note_id, LockedResource::TYPE_ENTITY, ModulesController::MODULE_NAME_NOTES, false, $is_allowed_to_see_resource_stmt) ){
                            unset($notes[$index]);
                        }
                    }

                    if( !empty($notes) ){
                        $has_category_family_active_note = true;
                    }

                }

                $have_categories_children = $this->app->repositories->myNotesCategoriesRepository->executeHaveCategoriesNotesStatement($have_categories_notes_stmt, $categories_ids);

                if( !$have_categories_children ){
                    break;
                }

                $categories_ids = $this->app->repositories->myNotesCategoriesRepository->getChildrenCategoriesIdsForCategoriesIds($categories_ids);

                if( empty($categories_ids) ){
                    break;
                }
        }

        if( $has_category_family_active_note ){
            return true;
        }

        return false;
    }

    /**
     * Returns one note for given id or null if nothing was found
     * @param int $id
     * @return MyNotes|null
     */
    public function getOneById(int $id): ?MyNotes
    {
        return $this->app->repositories->myNotesRepository->getOneById($id);
    }

    /**
     * @param array $categories_ids
     * @return MyNotes[]
     */
    public function getNotesByCategoriesIds(array $categories_ids): array
    {
        return $this->app->repositories->myNotesRepository->getNotesByCategoriesIds($categories_ids);
    }
}
