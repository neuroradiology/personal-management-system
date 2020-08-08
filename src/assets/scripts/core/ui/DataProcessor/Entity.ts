import Ajax                     from "../Ajax";
import AbstractAction           from "../Actions/AbstractAction";
import AbstractDataProcessor    from "./AbstractDataProcessor";
import DataProcessorInterface   from "./DataProcessorInterface";
import TinyMce                  from "../../../libs/tiny-mce/TinyMce";
import DataProcessorDto         from "../../../DTO/DataProcessorDto";
import BootboxWrapper from "../../../libs/bootbox/BootboxWrapper";
import Navigation from "../../Navigation";
import EntityStructure from "../BackendStructure/EntityStructure";

// todo: rename to base elemnents etc
// same with crud logic

/**
 * @description This class holds definitions what kind of data is being gathered on frontend
 *              how should it be additionally handled (callbacks, messages) etc.
 *
 *              This is explicitly used on Forms/Tables etc. which operate with whole entity,
 *              In case of some special forms where there is for example one field which is manipulated
 *              like password for whole profile - this class should not be used for this
 *
 *              This is required because there are few pretty flexible Repositories handling methods in backend which
 *              handled the special logic for requests like `soft delete`, `cascade soft delete`, validate etc,
 *
 *              So symfony backend needs to know what data must be processed, also the sent fields names do matter
 *              because the backend logic relies on it and tries to automatically find matching getters/setters etc.
 *
 *              On the other hand the fronted must know where (which selector for example) data for entity field is stored
 *              upon submitting action or form.
 *
 *              Lifecycle:
 *                  - frontend searches for elements matching selectors,
 *                  - extract the data from elements,
 *                  - sends it to backend to repositories/actions methods,
 *                  - backend then finds the entity and processes it with delivered data,
 *                  - frontend can react on the response with for example `afterCallback` function
 *
 */
export default class Entity extends AbstractDataProcessor {

    public static MySchedules: DataProcessorInterface = {
        makeCopyData($baseElement?: JQuery<HTMLElement>): DataProcessorDto | null {
            return undefined;
        },
        makeUpdateData($baseElement?: JQuery<HTMLElement>): DataProcessorDto | null {
            let id              = $($baseElement).find('.id').html();
            let name            = $($baseElement).find('.name').html();
            let scheduleType    = $($baseElement).find('.type :selected');
            let date            = $($baseElement).find('.date input').val();
            let information     = $($baseElement).find('.information').html();


            let successMessage = AbstractAction.messages.entityUpdateSuccess(Entity.MySchedules.processorName);
            let failMessage    = AbstractAction.messages.entityUpdateFail(Entity.MySchedules.processorName);

            let url      = '/my-schedule/update/';
            let ajaxData = {
                'name'         : name,
                'date'         : date,
                'information'  : information,
                'id'           : id,
                'scheduleType' : {
                    "type"        : "entity",
                    'namespace'   : EntityStructure.MyScheduleType.getNamespace(),
                    'id'          : $(scheduleType).val(),
                },
            };

            let dataProcessorsDto            = new DataProcessorDto();
            dataProcessorsDto.successMessage = successMessage;
            dataProcessorsDto.failMessage    = failMessage;
            dataProcessorsDto.url            = url;
            dataProcessorsDto.ajaxData       = ajaxData;

            return dataProcessorsDto;
        },
        makeRemoveData($baseElement?: JQuery<HTMLElement>): DataProcessorDto | null {
            let id              = $($baseElement).find('.id').html();
            let url             = '/my-schedule/remove/';
            let successMessage  = AbstractAction.messages.entityRemoveSuccess(Entity.MySchedules.processorName);
            let failMessage     = AbstractAction.messages.entityRemoveFail(Entity.MySchedules.processorName);
            let ajaxData        = {
                id: id
            };

            let dataProcessorsDto            = new DataProcessorDto();
            dataProcessorsDto.successMessage = successMessage;
            dataProcessorsDto.failMessage    = failMessage;
            dataProcessorsDto.url            = url;
            dataProcessorsDto.ajaxData       = ajaxData;
            dataProcessorsDto.isDataTable    = true;

            return dataProcessorsDto;
        },
        makeCreateData($baseElement?: JQuery<HTMLElement>): DataProcessorDto | null {
            let schedulesType = JSON.parse(Navigation.getCurrentGetAttrs()).schedules_type;

            let url             = '/my-schedules/' + schedulesType;
            let successMessage  = AbstractAction.messages.entityCreatedRecordSuccess(Entity.MySchedules.processorName);
            let failMessage     = AbstractAction.messages.entityCreatedRecordFail(Entity.MySchedules.processorName);

            let dataProcessorsDto            = new DataProcessorDto();
            dataProcessorsDto.successMessage = successMessage;
            dataProcessorsDto.failMessage    = failMessage;
            dataProcessorsDto.url            = url;

            return dataProcessorsDto;
        },
        processorName: "Schedule"
    };

    public static MySchedulesTypes: DataProcessorInterface = {
        makeCopyData($baseElement?: JQuery<HTMLElement>): DataProcessorDto | null {
            return null;
        },
        makeUpdateData($baseElement?: JQuery<HTMLElement>): DataProcessorDto | null {
            let id   = $($baseElement).find('.id').html();
            let name = $($baseElement).find('.name').html();
            let icon = $($baseElement).find('.icon').html();

            let successMessage = AbstractAction.messages.entityUpdateSuccess(Entity.MySchedulesTypes.processorName);
            let failMessage    = AbstractAction.messages.entityUpdateFail(Entity.MySchedulesTypes.processorName);

            let url = '/my-schedule-settings/schedule-type/update';
            let ajaxData = {
                'name': name,
                'icon': icon,
                'id'  : id
            };

            let dataProcessorsDto            = new DataProcessorDto();
            dataProcessorsDto.successMessage = successMessage;
            dataProcessorsDto.failMessage    = failMessage;
            dataProcessorsDto.ajaxData       = ajaxData;
            dataProcessorsDto.url            = url;

            return dataProcessorsDto;
        },
        makeRemoveData($baseElement?: JQuery<HTMLElement>): DataProcessorDto | null {
            let id              = $($baseElement).find('.id').html();
            let name            = $($baseElement).find('.name').html();
            let url             = '/my-schedule-settings/schedule-type/remove';
            let successMessage  = AbstractAction.messages.entityRemoveSuccess(Entity.MySchedulesTypes.processorName);
            let failMessage     = AbstractAction.messages.entityRemoveFail(Entity.MySchedulesTypes.processorName);
            let isDataTable     = false;
            let ajaxData        = {
                id: id
            };

            let message = 'You are about to remove schedule type named <b>' + name + ' </b>. There might be schedule connected with it. Are You 100% sure? This might break something...';

            let dataProcessorsDto            = new DataProcessorDto();
            dataProcessorsDto.successMessage = successMessage;
            dataProcessorsDto.failMessage    = failMessage;
            dataProcessorsDto.ajaxData       = ajaxData;
            dataProcessorsDto.isDataTable    = isDataTable;
            dataProcessorsDto.url            = url;
            dataProcessorsDto.confirmMessage = message;

            return dataProcessorsDto;
        },
        makeCreateData($baseElement?: JQuery<HTMLElement>): DataProcessorDto | null {
            let url            = '/my-schedules-settings';
            let successMessage = AbstractAction.messages.entityCreatedRecordSuccess(Entity.MySchedulesTypes.processorName);
            let failMessage    = AbstractAction.messages.entityCreatedRecordFail(Entity.MySchedulesTypes.processorName);
            let callback       = function (dataCallbackParams) {
                let ajax = new Ajax();
                let menuNodeModuleName = dataCallbackParams.menuNodeModuleName;

                if( "undefined" == typeof menuNodeModuleName){
                    throw ("menuNodeModuleName param is missing in ScheduleType::makeCreateData");
                }

                ajax.singleMenuNodeReload(menuNodeModuleName);
            };

            let dataProcessorsDto            = new DataProcessorDto();
            dataProcessorsDto.successMessage = successMessage;
            dataProcessorsDto.failMessage    = failMessage;
            dataProcessorsDto.callback       = callback;
            dataProcessorsDto.url            = url;

            return dataProcessorsDto;
        },
        processorName: "Schedule type",
    };

    public static MyPaymentsProduct:DataProcessorInterface = {
        makeCopyData($baseElement?: JQuery<HTMLElement>): DataProcessorDto | null {
            return null;
        },
        makeUpdateData($baseElement?: JQuery<HTMLElement>): DataProcessorDto | null {
            let id          = $($baseElement).find('.id').html();
            let name        = $($baseElement).find('.name').html();
            let price       = $($baseElement).find('.price input').val();
            let market      = $($baseElement).find('.market').html();
            let products    = $($baseElement).find('.products').html();
            let information = $($baseElement).find('.information').html();
            let rejected    = $($baseElement).find('.rejected input').prop("checked");

            let successMessage = AbstractAction.messages.entityUpdateSuccess(Entity.MyPaymentsProduct.processorName);
            let failMessage    = AbstractAction.messages.entityUpdateFail(Entity.MyPaymentsProduct.processorName);

            let url      = '/my-payments-products/update/';
            let ajaxData = {
                'id'         : id,
                'name'       : name,
                'price'      : price,
                'market'     : market,
                'products'   : products,
                'information': information,
                'rejected'   : rejected
            };

            let dataProcessorsDto            = new DataProcessorDto();
            dataProcessorsDto.ajaxData       = ajaxData;
            dataProcessorsDto.failMessage    = failMessage;
            dataProcessorsDto.successMessage = successMessage;
            dataProcessorsDto.url            = url;

            return dataProcessorsDto;
        },
        makeRemoveData($baseElement?: JQuery<HTMLElement>): DataProcessorDto | null {
            let id             = $($baseElement).find('.id').html();
            let url            = '/my-payments-products/remove/';
            let successMessage = AbstractAction.messages.entityRemoveSuccess(Entity.MyPaymentsProduct.processorName);
            let failMessage    = AbstractAction.messages.entityRemoveFail(Entity.MyPaymentsProduct.processorName);

            let ajaxData       = {
                    id: id
                };

            let dataProcessorsDto            = new DataProcessorDto();
            dataProcessorsDto.url            = url;
            dataProcessorsDto.successMessage = successMessage;
            dataProcessorsDto.failMessage    = failMessage;
            dataProcessorsDto.ajaxData       = ajaxData;
            dataProcessorsDto.isDataTable    = true;

            return dataProcessorsDto;
        },
        makeCreateData($baseElement?: JQuery<HTMLElement>): DataProcessorDto | null {
            let url             = '/my-payments-products';
            let successMessage  = AbstractAction.messages.entityCreatedRecordSuccess(Entity.MyPaymentsProduct.processorName);
            let failMessage     = AbstractAction.messages.entityCreatedRecordFail(Entity.MyPaymentsProduct.processorName);

            let dataProcessorsDto            = new DataProcessorDto();
            dataProcessorsDto.url            = url;
            dataProcessorsDto.successMessage = successMessage;
            dataProcessorsDto.failMessage    = failMessage;

            return dataProcessorsDto;
        },
        processorName: "Payment product",
    };

    public static MyPaymentsMonthly: DataProcessorInterface  = {
        makeCopyData($baseElement?: JQuery<HTMLElement>): DataProcessorDto | null {
            return null;
        },
        makeUpdateData($baseElement?: JQuery<HTMLElement>): DataProcessorDto | null {
            let id          = $($baseElement).find('.id').html();
            let date        = $($baseElement).find('.date input').val();
            let money       = $($baseElement).find('.money').html();
            let description = $($baseElement).find('.description').html();
            let paymentType = $($baseElement).find('.type :selected');

            let successMessage = AbstractAction.messages.entityUpdateSuccess(Entity.MyPaymentsMonthly.processorName);
            let failMessage    = AbstractAction.messages.entityUpdateFail(Entity.MyPaymentsMonthly.processorName);

            let url      = '/my-payments-monthly/update/';
            let ajaxData = {
                'id'            : id,
                'date'          : date,
                'money'         : money,
                'description'   : description,
                'type'              : {
                    "type"          : "entity",
                    'namespace'     : EntityStructure.MyPaymentsSettings.getNamespace(),
                    'id'            : $(paymentType).val(),
                },
            };
            
            let dataProcessorsDto            = new DataProcessorDto();
            dataProcessorsDto.url            = url;
            dataProcessorsDto.successMessage = successMessage;
            dataProcessorsDto.failMessage    = failMessage;
            dataProcessorsDto.ajaxData       = ajaxData;

            return dataProcessorsDto;
        },
        makeRemoveData($baseElement?: JQuery<HTMLElement>): DataProcessorDto | null {
            let id              = $($baseElement).find('.id').html();
            let url             = '/my-payments-monthly/remove/';
            let successMessage  = AbstractAction.messages.entityRemoveSuccess(Entity.MyPaymentsMonthly.processorName);
            let failMessage     = AbstractAction.messages.entityRemoveFail(Entity.MyPaymentsMonthly.processorName);
            let ajaxData        = {
                id: id
            };

            let dataProcessorsDto            = new DataProcessorDto();
            dataProcessorsDto.url            = url;
            dataProcessorsDto.successMessage = successMessage;
            dataProcessorsDto.failMessage    = failMessage;
            dataProcessorsDto.ajaxData       = ajaxData;
            dataProcessorsDto.isDataTable    = false;

            return dataProcessorsDto;
        },
        makeCreateData($baseElement?: JQuery<HTMLElement>): DataProcessorDto | null {
            let url             = '/my-payments-monthly';
            let successMessage  = AbstractAction.messages.entityCreatedRecordSuccess(Entity.MyPaymentsMonthly.processorName);
            let failMessage     = AbstractAction.messages.entityCreatedRecordFail(Entity.MyPaymentsMonthly.processorName);

            let dataProcessorsDto            = new DataProcessorDto();
            dataProcessorsDto.url            = url;
            dataProcessorsDto.successMessage = successMessage;
            dataProcessorsDto.failMessage    = failMessage;

            return dataProcessorsDto;
        },
        processorName: "Payment monthly",
    };

    public static MyRecurringPaymentsMonthly = {
        makeCopyData($baseElement?: JQuery<HTMLElement>): DataProcessorDto | null {
            return null;
        },
        makeUpdateData($baseElement?: JQuery<HTMLElement>): DataProcessorDto | null {
            let id          = $($baseElement).find('.id').html();
            let date        = $($baseElement).find('.date input').val();
            let money       = $($baseElement).find('.money').html();
            let description = $($baseElement).find('.description').html();
            let paymentType = $($baseElement).find('.type :selected');

            let successMessage  = AbstractAction.messages.entityUpdateSuccess(Entity.MyRecurringPaymentsMonthly.processorName);
            let failMessage     = AbstractAction.messages.entityUpdateFail(Entity.MyRecurringPaymentsMonthly.processorName);

            let url      = 'my-recurring-payments-monthly/update/';
            let ajaxData = {
                'id'            : id,
                'date'          : date,
                'money'         : money,
                'description'   : description,
                'type'          : {
                    "type"          : "entity",
                    'namespace'     : EntityStructure.MyPaymentsSettings.getNamespace(),
                    'id'            : $(paymentType).val(),
                },
            };

            let dataProcessorsDto            = new DataProcessorDto();
            dataProcessorsDto.url            = url;
            dataProcessorsDto.successMessage = successMessage;
            dataProcessorsDto.failMessage    = failMessage;
            dataProcessorsDto.ajaxData       = ajaxData;

            return dataProcessorsDto;
        },
        makeRemoveData($baseElement?: JQuery<HTMLElement>): DataProcessorDto | null {
            let id              = $($baseElement).find('.id').html();
            let url             = '/my-recurring-payments-monthly/remove/';
            let successMessage  = AbstractAction.messages.entityRemoveSuccess(Entity.MyRecurringPaymentsMonthly.processorName);
            let failMessage     = AbstractAction.messages.entityRemoveFail(Entity.MyRecurringPaymentsMonthly.processorName);
            let ajaxData        = {
                id: id
            };

            let dataProcessorsDto            = new DataProcessorDto();
            dataProcessorsDto.url            = url;
            dataProcessorsDto.successMessage = successMessage;
            dataProcessorsDto.failMessage    = failMessage;
            dataProcessorsDto.ajaxData       = ajaxData;
            dataProcessorsDto.isDataTable    = false;

            return dataProcessorsDto;
        },
        makeCreateData($baseElement?: JQuery<HTMLElement>): DataProcessorDto | null {
            let url             = '/my-recurring-payments-monthly-settings';
            let successMessage  = AbstractAction.messages.entityCreatedRecordSuccess(Entity.MyRecurringPaymentsMonthly.processorName);
            let failMessage     = AbstractAction.messages.entityCreatedRecordFail(Entity.MyRecurringPaymentsMonthly.processorName);

            let dataProcessorsDto            = new DataProcessorDto();
            dataProcessorsDto.url            = url;
            dataProcessorsDto.successMessage = successMessage;
            dataProcessorsDto.failMessage    = failMessage;

            return dataProcessorsDto;
        },
        processorName: "Recurring payment monthly",
    };

    public static MyPaymentsOwed: DataProcessorInterface = {
        makeCopyData($baseElement?: JQuery<HTMLElement>): DataProcessorDto | null {
            return null;
        },
        makeUpdateData($baseElement?: JQuery<HTMLElement>): DataProcessorDto | null {
            let id          = $($baseElement).find('.id').html();
            let date        = $($baseElement).find('.date input').val();
            let target      = $($baseElement).find('.target').html();
            let amount      = $($baseElement).find('.amount').html();
            let information = $($baseElement).find('.information').html();
            let currency    = $($baseElement).find('.currency').find("select").val();

            let successMessage = AbstractAction.messages.entityUpdateSuccess(Entity.MyPaymentsOwed.processorName);
            let failMessage = AbstractAction.messages.entityUpdateFail(Entity.MyPaymentsOwed.processorName);

            let url = '/my-payments-owed/update/';
            let ajaxData = {
                'id'         : id,
                'date'       : date,
                'target'     : target,
                'amount'     : amount,
                'currency'   : currency,
                'information': information,
            };

            let dataProcessorsDto            = new DataProcessorDto();
            dataProcessorsDto.url            = url;
            dataProcessorsDto.successMessage = successMessage;
            dataProcessorsDto.failMessage    = failMessage;
            dataProcessorsDto.ajaxData       = ajaxData;

            return dataProcessorsDto;
        },
        makeRemoveData($baseElement?: JQuery<HTMLElement>): DataProcessorDto | null {
            let id              = $($baseElement).find('.id').html();
            let url             = '/my-payments-owed/remove/';
            let successMessage  = AbstractAction.messages.entityRemoveSuccess(Entity.MyPaymentsOwed.processorName);
            let failMessage     = AbstractAction.messages.entityRemoveFail(Entity.MyPaymentsOwed.processorName);
            let ajaxData        = {
                id: id
            };

            let dataProcessorsDto            = new DataProcessorDto();
            dataProcessorsDto.url            = url;
            dataProcessorsDto.successMessage = successMessage;
            dataProcessorsDto.failMessage    = failMessage;
            dataProcessorsDto.ajaxData       = ajaxData;
            dataProcessorsDto.isDataTable    = false;

            return dataProcessorsDto;
        },
        makeCreateData($baseElement?: JQuery<HTMLElement>): DataProcessorDto | null {
            let url            = '/my-payments-owed';
            let successMessage = AbstractAction.messages.entityCreatedRecordSuccess(Entity.MyPaymentsOwed.processorName);
            let failMessage    = AbstractAction.messages.entityCreatedRecordFail(Entity.MyPaymentsOwed.processorName);

            let dataProcessorsDto            = new DataProcessorDto();
            dataProcessorsDto.url            = url;
            dataProcessorsDto.successMessage = successMessage;
            dataProcessorsDto.failMessage    = failMessage;

            return dataProcessorsDto;
        },
        processorName: "Payment owed",
    };

    public static MyPaymentsIncome: DataProcessorInterface = {
        makeCopyData($baseElement?: JQuery<HTMLElement>): DataProcessorDto | null {
            return null;
        },
        makeUpdateData($baseElement?: JQuery<HTMLElement>): DataProcessorDto | null {
            let id          = $($baseElement).find('.id').html();
            let date        = $($baseElement).find('.date input').val();
            let amount      = $($baseElement).find('.amount').html();
            let information = $($baseElement).find('.information').html();
            let currency    = $($baseElement).find('.currency').find("select").val();

            let successMessage = AbstractAction.messages.entityUpdateSuccess(Entity.MyPaymentsIncome.processorName);
            let failMessage    = AbstractAction.messages.entityUpdateFail(Entity.MyPaymentsIncome.processorName);

            let url = '/my-payments-income/update/';
            let ajaxData = {
                'id'         : id,
                'date'       : date,
                'amount'     : amount,
                'currency'   : currency,
                'information': information,
            };

            let dataProcessorsDto            = new DataProcessorDto();
            dataProcessorsDto.url            = url;
            dataProcessorsDto.successMessage = successMessage;
            dataProcessorsDto.failMessage    = failMessage;
            dataProcessorsDto.ajaxData       = ajaxData;

            return dataProcessorsDto;
        },
        makeRemoveData($baseElement?: JQuery<HTMLElement>): DataProcessorDto | null {
            let id             = $($baseElement).find('.id').html();
            let url            = '/my-payments-income/remove/';
            let successMessage = AbstractAction.messages.entityRemoveSuccess(Entity.MyPaymentsIncome.processorName);
            let failMessage    = AbstractAction.messages.entityRemoveFail(Entity.MyPaymentsIncome.processorName);
            let ajaxData       = {
                id: id
            };

            let dataProcessorsDto            = new DataProcessorDto();
            dataProcessorsDto.url            = url;
            dataProcessorsDto.successMessage = successMessage;
            dataProcessorsDto.failMessage    = failMessage;
            dataProcessorsDto.ajaxData       = ajaxData;
            dataProcessorsDto.isDataTable    = false;

            return dataProcessorsDto;
        },
        makeCreateData($baseElement?: JQuery<HTMLElement>): DataProcessorDto | null {
            let url             = '/my-payments-income';
            let successMessage = AbstractAction.messages.entityCreatedRecordSuccess(Entity.MyPaymentsIncome.processorName);
            let failMessage    = AbstractAction.messages.entityCreatedRecordFail(Entity.MyPaymentsIncome.processorName);

            let dataProcessorsDto            = new DataProcessorDto();
            dataProcessorsDto.url            = url;
            dataProcessorsDto.successMessage = successMessage;
            dataProcessorsDto.failMessage    = failMessage;

            return dataProcessorsDto;
        },
        processorName: "Payment income",
    };

    public static MyJobAfterhours: DataProcessorInterface = {
        makeCopyData($baseElement?: JQuery<HTMLElement>): DataProcessorDto | null {
            return null;
        },
        makeUpdateData($baseElement?: JQuery<HTMLElement>): DataProcessorDto | null {
            let id          = $($baseElement).find('.id').html();
            let date        = $($baseElement).find('.date input').val();
            let minutes     = $($baseElement).find('.minutes input').val();
            let description = $($baseElement).find('.description').html();
            let type        = $($baseElement).find('.type').html();
            let goal        = $($baseElement).find('.goal').html();

            let successMessage = AbstractAction.messages.entityUpdateSuccess(Entity.MyJobAfterhours.processorName);
            let failMessage    = AbstractAction.messages.entityUpdateFail(Entity.MyJobAfterhours.processorName);

            let url      = '/my-job/afterhours/update/';
            let ajaxData = {
                'date'          : date,
                'description'   : description,
                'minutes'       : minutes,
                'type'          : type,
                'id'            : id,
                'goal'          : goal,
            };

            let dataProcessorsDto            = new DataProcessorDto();
            dataProcessorsDto.url            = url;
            dataProcessorsDto.successMessage = successMessage;
            dataProcessorsDto.failMessage    = failMessage;
            dataProcessorsDto.ajaxData       = ajaxData;

            return dataProcessorsDto;
        },
        makeRemoveData($baseElement?: JQuery<HTMLElement>): DataProcessorDto | null {
            let id              = $($baseElement).find('.id').html();
            let url             = '/my-job/afterhours/remove/';
            let successMessage  = AbstractAction.messages.entityRemoveSuccess(Entity.MyJobAfterhours.processorName);
            let failMessage     = AbstractAction.messages.entityRemoveFail(Entity.MyJobAfterhours.processorName);

            let dataProcessorsDto            = new DataProcessorDto();
            dataProcessorsDto.url            = url;
            dataProcessorsDto.successMessage = successMessage;
            dataProcessorsDto.failMessage    = failMessage;
            dataProcessorsDto.isDataTable    = false;

            return dataProcessorsDto;
        },
        makeCreateData($baseElement?: JQuery<HTMLElement>): DataProcessorDto | null {
            let url             = '/my-job/afterhours';
            let successMessage  = AbstractAction.messages.entityCreatedRecordSuccess(Entity.MySchedules.processorName);
            let failMessage     = AbstractAction.messages.entityCreatedRecordFail(Entity.MySchedules.processorName);

            let dataProcessorsDto            = new DataProcessorDto();
            dataProcessorsDto.url            = url;
            dataProcessorsDto.successMessage = successMessage;
            dataProcessorsDto.failMessage    = failMessage;

            return dataProcessorsDto;
        },
        processorName: "Job afterhour",
    };

    public static MyJobHolidays: DataProcessorInterface = {
        makeCopyData($baseElement?: JQuery<HTMLElement>): DataProcessorDto | null {
            return null;
        },
        makeUpdateData($baseElement?: JQuery<HTMLElement>): DataProcessorDto | null {
            let id          = $($baseElement).find('.id').html();
            let year        = $($baseElement).find('.year').html();
            let daysSpent   = $($baseElement).find('.daysSpent').find("input").val();
            let information = $($baseElement).find('.information').html();

            let successMessage = AbstractAction.messages.entityUpdateSuccess(Entity.MyJobHolidays.processorName);
            let failMessage    = AbstractAction.messages.entityUpdateFail(Entity.MyJobHolidays.processorName);

            let url      = '/my-job/holidays/update/';
            let ajaxData = {
                'year'          : year,
                'daysSpent'     : daysSpent,
                'information'   : information,
                'id'            : id,
            };
            
            let dataProcessorsDto            = new DataProcessorDto();
            dataProcessorsDto.url            = url;
            dataProcessorsDto.successMessage = successMessage;
            dataProcessorsDto.failMessage    = failMessage;
            dataProcessorsDto.ajaxData       = ajaxData;

            return dataProcessorsDto;
        },
        makeRemoveData($baseElement?: JQuery<HTMLElement>): DataProcessorDto | null {
            let id             = $($baseElement).find('.id').html();
            let url            = '/my-job/holidays/remove/';
            let failMessage    = AbstractAction.messages.entityRemoveFail(Entity.MyJobHolidays.processorName);
            let successMessage = AbstractAction.messages.entityRemoveSuccess(Entity.MyJobHolidays.processorName);
            
            let ajaxData       = {
                id: id
            };

            let dataProcessorsDto            = new DataProcessorDto();
            dataProcessorsDto.url            = url;
            dataProcessorsDto.successMessage = successMessage;
            dataProcessorsDto.failMessage    = failMessage;
            dataProcessorsDto.ajaxData       = ajaxData;
            dataProcessorsDto.isDataTable    = false;

            return dataProcessorsDto;

        },
        makeCreateData($baseElement?: JQuery<HTMLElement>): DataProcessorDto | null {
            let url             = '/my-job/holidays';
            let failMessage    = AbstractAction.messages.entityCreatedRecordFail(Entity.MyJobHolidays.processorName);
            let successMessage = AbstractAction.messages.entityCreatedRecordSuccess(Entity.MyJobHolidays.processorName);

            let dataProcessorsDto            = new DataProcessorDto();
            dataProcessorsDto.url            = url;
            dataProcessorsDto.successMessage = successMessage;
            dataProcessorsDto.failMessage    = failMessage;

            return dataProcessorsDto;
        },
        processorName: "Job holiday",
    };

    public static MyJobHolidaysPool: DataProcessorInterface = {
        makeCopyData($baseElement?: JQuery<HTMLElement>): DataProcessorDto | null {
            return null;
        },
        makeUpdateData($baseElement?: JQuery<HTMLElement>): DataProcessorDto | null {
            let id          = $($baseElement).find('.id').html();
            let year        = $($baseElement).find('.year input').val();
            let daysInPool  = $($baseElement).find('.daysInPool input').val();
            let companyName = $($baseElement).find('.companyName').html();

            let successMessage = AbstractAction.messages.entityUpdateSuccess(Entity.MyJobHolidaysPool.processorName);
            let failMessage    = AbstractAction.messages.entityUpdateFail(Entity.MyJobHolidaysPool.processorName);

            let url = '/my-job/holidays-pool/update/';
            let ajaxData = {
                'year'          : year,
                'daysInPool'    : daysInPool,
                'companyName'   : companyName,
                'id'            : id,
            };
            let dataProcessorsDto            = new DataProcessorDto();
            dataProcessorsDto.url            = url;
            dataProcessorsDto.successMessage = successMessage;
            dataProcessorsDto.failMessage    = failMessage;
            dataProcessorsDto.ajaxData       = ajaxData;

            return dataProcessorsDto;
        },
        makeRemoveData($baseElement?: JQuery<HTMLElement>): DataProcessorDto | null {
            let id             = $($baseElement).find('.id').html();
            let url            = '/my-job/holidays-pool/remove/';
            let failMessage    = AbstractAction.messages.entityRemoveFail(Entity.MyJobHolidaysPool.processorName);
            let successMessage = AbstractAction.messages.entityRemoveSuccess(Entity.MyJobHolidaysPool.processorName);

            let ajaxData       = {
                id: id
            };

            let dataProcessorsDto            = new DataProcessorDto();
            dataProcessorsDto.url            = url;
            dataProcessorsDto.successMessage = successMessage;
            dataProcessorsDto.failMessage    = failMessage;
            dataProcessorsDto.ajaxData       = ajaxData;
            dataProcessorsDto.isDataTable    = false;

            return dataProcessorsDto;

        },
        makeCreateData($baseElement?: JQuery<HTMLElement>): DataProcessorDto | null {
            let url             = '/my-job/settings';
            let failMessage    = AbstractAction.messages.entityCreatedRecordFail(Entity.MyJobHolidaysPool.processorName);
            let successMessage = AbstractAction.messages.entityCreatedRecordSuccess(Entity.MyJobHolidaysPool.processorName);

            let dataProcessorsDto            = new DataProcessorDto();
            dataProcessorsDto.url            = url;
            dataProcessorsDto.successMessage = successMessage;
            dataProcessorsDto.failMessage    = failMessage;

            return dataProcessorsDto;
        },
        processorName: "Job holiday pool",
    };

    public static MyShoppingPlans: DataProcessorInterface = {
        makeCopyData($baseElement?: JQuery<HTMLElement>): DataProcessorDto | null {
            return null;
        },
        makeUpdateData($baseElement?: JQuery<HTMLElement>): DataProcessorDto | null {
            let id          = $($baseElement).find('.id').html();
            let information = $($baseElement).find('.information').html();
            let example     = $($baseElement).find('.example').html();
            let name        = $($baseElement).find('.name').html();

            let successMessage = AbstractAction.messages.entityUpdateSuccess(Entity.MyShoppingPlans.processorName);
            let failMessage    = AbstractAction.messages.entityUpdateFail(Entity.MyShoppingPlans.processorName);

            let url      = '/my-shopping/plans/update/';
            let ajaxData = {
                'id'            : id,
                'information'   : information,
                'example'       : example,
                'name'          : name
            };

            let dataProcessorsDto            = new DataProcessorDto();
            dataProcessorsDto.url            = url;
            dataProcessorsDto.successMessage = successMessage;
            dataProcessorsDto.failMessage    = failMessage;
            dataProcessorsDto.ajaxData       = ajaxData;

            return dataProcessorsDto;
        },
        makeRemoveData($baseElement?: JQuery<HTMLElement>): DataProcessorDto | null {
            let id              = $($baseElement).find('.id').html();
            let url             = '/my-shopping/plans/remove/';
            let successMessage  = AbstractAction.messages.entityRemoveSuccess(Entity.MyShoppingPlans.processorName);
            let failMessage     = AbstractAction.messages.entityRemoveFail(Entity.MyShoppingPlans.processorName);

            let ajaxData       = {
                id: id
            };

            let dataProcessorsDto            = new DataProcessorDto();
            dataProcessorsDto.url            = url;
            dataProcessorsDto.successMessage = successMessage;
            dataProcessorsDto.failMessage    = failMessage;
            dataProcessorsDto.ajaxData       = ajaxData;
            dataProcessorsDto.isDataTable    = false;

            return dataProcessorsDto;

        },
        makeCreateData($baseElement?: JQuery<HTMLElement>): DataProcessorDto | null {
            let url             = '/my-shopping/plans';
            let successMessage  = AbstractAction.messages.entityCreatedRecordSuccess(Entity.MyShoppingPlans.processorName);
            let failMessage     = AbstractAction.messages.entityCreatedRecordFail(Entity.MyShoppingPlans.processorName);

            let dataProcessorsDto            = new DataProcessorDto();
            dataProcessorsDto.url            = url;
            dataProcessorsDto.successMessage = successMessage;
            dataProcessorsDto.failMessage    = failMessage;

            return dataProcessorsDto;
        },
        processorName: "My shopping plan",
    };

    public static MyTravelsIdeas: DataProcessorInterface = {
        makeCopyData($baseElement?: JQuery<HTMLElement>): DataProcessorDto | null {
            return null;
        },
        makeUpdateData($baseElement?: JQuery<HTMLElement>): DataProcessorDto | null {
            let id          = $($baseElement).find('.id').html();
            let location    = $($baseElement).find('.location span').html();
            let country     = $($baseElement).find('.country span').html();
            let image       = $($baseElement).find('.image img').attr('src');
            let map         = $($baseElement).find('.map a').attr('href');
            let category    = $($baseElement).find('.category i').html();

            let successMessage  = AbstractAction.messages.entityUpdateSuccess(Entity.MyTravelsIdeas.processorName);
            let failMessage     = AbstractAction.messages.entityUpdateFail(Entity.MyTravelsIdeas.processorName);

            let url      = '/my-travels/ideas/update/';
            let ajaxData = {
                'location'  : location,
                'country'   : country,
                'image'     : image,
                'map'       : map,
                'category'  : category,
                'id'        : id
            };

            let dataProcessorsDto            = new DataProcessorDto();
            dataProcessorsDto.url            = url;
            dataProcessorsDto.successMessage = successMessage;
            dataProcessorsDto.failMessage    = failMessage;
            dataProcessorsDto.ajaxData       = ajaxData;

            return dataProcessorsDto;
        },
        makeRemoveData($baseElement?: JQuery<HTMLElement>): DataProcessorDto | null {
            let id              = $($baseElement).find('.id').html();
            let url             = '/my-travels/ideas/remove/';
            let successMessage  = AbstractAction.messages.entityRemoveSuccess(Entity.MyTravelsIdeas.processorName);
            let failMessage     = AbstractAction.messages.entityRemoveFail(Entity.MyTravelsIdeas.processorName);

            let ajaxData        = {
                id: id
            };

            let dataProcessorsDto            = new DataProcessorDto();
            dataProcessorsDto.url            = url;
            dataProcessorsDto.successMessage = successMessage;
            dataProcessorsDto.failMessage    = failMessage;
            dataProcessorsDto.ajaxData       = ajaxData;
            dataProcessorsDto.isDataTable    = false;

            return dataProcessorsDto;

        },
        makeCreateData($baseElement?: JQuery<HTMLElement>): DataProcessorDto | null {
            let url             = '/my-travels/ideas';
            let successMessage  = AbstractAction.messages.entityCreatedRecordSuccess(Entity.MyTravelsIdeas.processorName);
            let failMessage     = AbstractAction.messages.entityCreatedRecordFail(Entity.MyTravelsIdeas.processorName);

            let dataProcessorsDto            = new DataProcessorDto();
            dataProcessorsDto.url            = url;
            dataProcessorsDto.successMessage = successMessage;
            dataProcessorsDto.failMessage    = failMessage;

            return dataProcessorsDto;
        },
        processorName: "My travel idea",
    };

    public static Achievements: DataProcessorInterface = {
        makeCopyData($baseElement?: JQuery<HTMLElement>): DataProcessorDto | null {
            return null;
        },
        makeUpdateData($baseElement?: JQuery<HTMLElement>): DataProcessorDto | null {
            let id          = $($baseElement).find('.id').html();
            let type        = $($baseElement).find('.type').html();
            let description = $($baseElement).find('.description').html();
            let name        = $($baseElement).find('.name').html();

            let successMessage  = AbstractAction.messages.entityUpdateSuccess(Entity.Achievements.processorName);
            let failMessage     = AbstractAction.messages.entityUpdateFail(Entity.Achievements.processorName);

            let url = '/achievement/update/';
            let ajaxData = {
                'id'          : id,
                'name'        : name,
                'description' : description,
                'type'        : type
            };

            let dataProcessorsDto            = new DataProcessorDto();
            dataProcessorsDto.url            = url;
            dataProcessorsDto.successMessage = successMessage;
            dataProcessorsDto.failMessage    = failMessage;
            dataProcessorsDto.ajaxData       = ajaxData;

            return dataProcessorsDto;
        },
        makeRemoveData($baseElement?: JQuery<HTMLElement>): DataProcessorDto | null {
            let id              = $($baseElement).find('.id').html();
            let url             = '/achievement/remove/';
            let successMessage  = AbstractAction.messages.entityRemoveSuccess(Entity.Achievements.processorName);
            let failMessage     = AbstractAction.messages.entityRemoveFail(Entity.Achievements.processorName);

            let ajaxData       = {
                id: id
            };

            let dataProcessorsDto            = new DataProcessorDto();
            dataProcessorsDto.url            = url;
            dataProcessorsDto.successMessage = successMessage;
            dataProcessorsDto.failMessage    = failMessage;
            dataProcessorsDto.ajaxData       = ajaxData;
            dataProcessorsDto.isDataTable    = false;

            return dataProcessorsDto;
        },
        makeCreateData($baseElement?: JQuery<HTMLElement>): DataProcessorDto | null {
            let url             = '/achievement';
            let successMessage  = AbstractAction.messages.entityCreatedRecordSuccess(Entity.Achievements.processorName);
            let failMessage     = AbstractAction.messages.entityCreatedRecordFail(Entity.Achievements.processorName);

            let dataProcessorsDto            = new DataProcessorDto();
            dataProcessorsDto.url            = url;
            dataProcessorsDto.successMessage = successMessage;
            dataProcessorsDto.failMessage    = failMessage;

            return dataProcessorsDto;
        },
        processorName: "achievement",
    };

    public static MyNotesCategories: DataProcessorInterface = {
        makeUpdateData($baseElement?: JQuery<HTMLElement>): DataProcessorDto | null {
            let id      = $($baseElement).find('.id').html();
            let name    = $($baseElement).find('.name').html();
            let icon    = $($baseElement).find('.icon').html();
            let color   = $($baseElement).find('.color').text();
            let parent  = $($baseElement).find('.parent').find(':selected').val();

            let successMessage = AbstractAction.messages.entityUpdateSuccess(Entity.MyNotesCategories.processorName);
            let failMessage = AbstractAction.messages.entityUpdateFail(Entity.MyNotesCategories.processorName);

            let url      = '/my-notes/settings/update/';
            let ajaxData = {
                'name'      : name,
                'icon'      : icon,
                'color'     : color,
                'parent_id' : parent,
                'id'        : id
            };

            let dataProcessorsDto            = new DataProcessorDto();
            dataProcessorsDto.url            = url;
            dataProcessorsDto.successMessage = successMessage;
            dataProcessorsDto.failMessage    = failMessage;
            dataProcessorsDto.ajaxData       = ajaxData;

            return dataProcessorsDto;
        },
        makeRemoveData($baseElement?: JQuery<HTMLElement>): DataProcessorDto | null {
            let id              = $($baseElement).find('.id').html();
            let url             = '/my-notes/settings/remove/';
            let successMessage  = AbstractAction.messages.entityRemoveSuccess(Entity.MyNotesCategories.processorName);
            let failMessage     = AbstractAction.messages.entityRemoveFail(Entity.MyNotesCategories.processorName);
            let confirmMessage  = "This category might contain notes or be parent of other category. Do You really want to remove it?";
            let ajaxData        = {
                id: id
            };

            let dataProcessorsDto            = new DataProcessorDto();
            dataProcessorsDto.url            = url;
            dataProcessorsDto.successMessage = successMessage;
            dataProcessorsDto.failMessage    = failMessage;
            dataProcessorsDto.ajaxData       = ajaxData;
            dataProcessorsDto.isDataTable    = false;
            dataProcessorsDto.confirmMessage = confirmMessage;

            return dataProcessorsDto;
        },
        makeCreateData($baseElement?: JQuery<HTMLElement>): DataProcessorDto | null {
            let url             = '/my-notes/settings';
            let successMessage  = AbstractAction.messages.entityCreatedRecordSuccess(Entity.MyNotesCategories.processorName);
            let failMessage     = AbstractAction.messages.entityCreatedRecordFail(Entity.MyNotesCategories.processorName);

            let dataProcessorsDto            = new DataProcessorDto();
            dataProcessorsDto.url            = url;
            dataProcessorsDto.successMessage = successMessage;
            dataProcessorsDto.failMessage    = failMessage;

            return dataProcessorsDto;
        },
        makeCopyData($baseElement?: JQuery<HTMLElement>): DataProcessorDto | null {
            return null;
        },
        processorName: "Note category",
    };

    public static MyNotes: DataProcessorInterface = {
        makeRemoveData($baseElement?: JQuery<HTMLElement>): DataProcessorDto | null {
            return null;
        }, makeUpdateData($baseElement?: JQuery<HTMLElement>): DataProcessorDto | null {
            return null;
        },
        makeCopyData($baseElement?: JQuery<HTMLElement>): DataProcessorDto | null {
            return null;
        },
        makeCreateData($baseElement?: JQuery<HTMLElement>): DataProcessorDto | null {
            let url             = '/my-notes/create';
            let successMessage  = AbstractAction.messages.entityCreatedRecordSuccess(Entity.MyNotes.processorName);
            let failMessage     = AbstractAction.messages.entityCreatedRecordFail(Entity.MyNotes.processorName);

            let dataProcessorsDto            = new DataProcessorDto();
            dataProcessorsDto.url            = url;
            dataProcessorsDto.successMessage = successMessage;
            dataProcessorsDto.failMessage    = failMessage;
            dataProcessorsDto.callbackForLoadingModuleContentByUrl = () => {
                TinyMce.remove(".tiny-mce"); //tinymce must be removed or won't be reinitialized.
            };

            return dataProcessorsDto;
        },
        processorName: "Note"
    };

    public static MyPaymentsSettings: DataProcessorInterface = {
        /**
         * @info Important! At this moment settings panel has only option to add currency and types
         * while currency will be rarely changed if changed at all, I've prepared this to work only with types
         */
        makeUpdateData($baseElement?: JQuery<HTMLElement>): DataProcessorDto | null {
            let id    = $($baseElement).find('.id').html();
            let value = $($baseElement).find('.value').html();

            let successMessage = AbstractAction.messages.entityUpdateSuccess(Entity.MyPaymentsSettings.processorName);
            let failMessage    = AbstractAction.messages.entityUpdateFail(Entity.MyPaymentsSettings.processorName);

            let url      = '/my-payments-settings/update';
            let ajaxData = {
                'value' : value,
                'id'    : id
            };

            let dataProcessorsDto            = new DataProcessorDto();
            dataProcessorsDto.url            = url;
            dataProcessorsDto.successMessage = successMessage;
            dataProcessorsDto.failMessage    = failMessage;
            dataProcessorsDto.ajaxData       = ajaxData;

            return dataProcessorsDto;
        },
        makeRemoveData($baseElement?: JQuery<HTMLElement>): DataProcessorDto | null {
            let id              = $($baseElement).find('.id').html();
            let url             = '/my-payments-settings/remove/';
            let value           = $($baseElement).find('.value').html();
            let successMessage  = AbstractAction.messages.entityRemoveSuccess(Entity.MyPaymentsSettings.processorName);
            let failMessage     = AbstractAction.messages.entityRemoveFail(Entity.MyPaymentsSettings.processorName);
            let confirmMessage  = 'You are about to remove type named <b>' + value + ' </b>. There might be payment connected with it. Are You 100% sure? This might break something...';
            let ajaxData        = {
                id: id
            };

            let dataProcessorsDto            = new DataProcessorDto();
            dataProcessorsDto.url            = url;
            dataProcessorsDto.successMessage = successMessage;
            dataProcessorsDto.failMessage    = failMessage;
            dataProcessorsDto.ajaxData       = ajaxData;
            dataProcessorsDto.isDataTable    = false;
            dataProcessorsDto.confirmMessage = confirmMessage;

            return dataProcessorsDto;
        },
        makeCreateData($baseElement?: JQuery<HTMLElement>): DataProcessorDto | null {
            let url             = '/my-payments-settings';
            let successMessage  = AbstractAction.messages.entityCreatedRecordSuccess(Entity.MyPaymentsSettings.processorName);
            let failMessage     = AbstractAction.messages.entityCreatedRecordFail(Entity.MyPaymentsSettings.processorName);

            let dataProcessorsDto            = new DataProcessorDto();
            dataProcessorsDto.url            = url;
            dataProcessorsDto.successMessage = successMessage;
            dataProcessorsDto.failMessage    = failMessage;

            return dataProcessorsDto;
        },
        makeCopyData($baseElement?: JQuery<HTMLElement>): DataProcessorDto | null {
            return null;
        },
        processorName: "Payment setting",
    };

    public static MyContactType: DataProcessorInterface = {
        makeCopyData($baseElement?: JQuery<HTMLElement>): DataProcessorDto | null {
            return null;
        },
        makeUpdateData($baseElement?: JQuery<HTMLElement>): DataProcessorDto | null {
            let id          = $($baseElement).find('.id').html();
            let name        = $($baseElement).find('.name').html();
            let imagePath   = $($baseElement).find('.image_path').html();

            let successMessage = AbstractAction.messages.entityUpdateSuccess(Entity.MyContactType.processorName);
            let failMessage    = AbstractAction.messages.entityUpdateFail(Entity.MyContactType.processorName);

            let url = '/my-contacts-types/update';
            let ajaxData = {
                'imagePath': imagePath,
                'name'      : name,
                'id'        : id
            };

            let dataProcessorsDto            = new DataProcessorDto();
            dataProcessorsDto.url            = url;
            dataProcessorsDto.successMessage = successMessage;
            dataProcessorsDto.failMessage    = failMessage;
            dataProcessorsDto.ajaxData       = ajaxData;

            return dataProcessorsDto;
        },
        makeRemoveData($baseElement?: JQuery<HTMLElement>): DataProcessorDto | null {
            let id              = $($baseElement).find('.id').html();
            let name            = $($baseElement).find('.name').html();
            let url             = '/my-contacts-types/remove';
            let successMessage  = AbstractAction.messages.entityRemoveSuccess(Entity.MyContactType.processorName);
            let failMessage     = AbstractAction.messages.entityRemoveFail(Entity.MyContactType.processorName);
            let confirmMessage  = 'You are about to remove type named <b>' + name + ' </b>. There might be contact connected with it. Are You 100% sure? This might break something...';
            let ajaxData        = {
                id: id
            };

            let dataProcessorsDto                = new DataProcessorDto();
            dataProcessorsDto.url                = url;
            dataProcessorsDto.successMessage     = successMessage;
            dataProcessorsDto.failMessage        = failMessage;
            dataProcessorsDto.ajaxData           = ajaxData;
            dataProcessorsDto.isDataTable        = false;
            dataProcessorsDto.confirmMessage     = confirmMessage;
            dataProcessorsDto.useAjaxFailMessage = true;

            return dataProcessorsDto;
        },
        makeCreateData($baseElement?: JQuery<HTMLElement>): DataProcessorDto | null {
            let url            = '/my-contacts-settings';
            let successMessage = AbstractAction.messages.entityCreatedRecordSuccess(Entity.MyContactType.processorName);
            let failMessage    = AbstractAction.messages.entityCreatedRecordFail(Entity.MyContactType.processorName);

            let dataProcessorsDto            = new DataProcessorDto();
            dataProcessorsDto.url            = url;
            dataProcessorsDto.successMessage = successMessage;
            dataProcessorsDto.failMessage    = failMessage;

            return dataProcessorsDto;
        },
        processorName: "Contact type",
    };

    public static MyContact: DataProcessorInterface = {
        makeCreateData($baseElement?: JQuery<HTMLElement>): DataProcessorDto | null {
            return null;
        }, makeRemoveData($baseElement?: JQuery<HTMLElement>): DataProcessorDto | null {
            return null;
        },
        /**
         * This case cannot be handled like usual forms like above as items can be added via js
         * @param $baseElement {object}
         */
        makeUpdateData($baseElement?: JQuery<HTMLElement>): DataProcessorDto | null {
            let $form              = $($baseElement).find('form');
            let serializedFormData = $form.serialize();

            let successMessage = AbstractAction.messages.entityUpdateSuccess(Entity.MyContact.processorName);
            let failMessage    = AbstractAction.messages.entityUpdateFail(Entity.MyContact.processorName);

            let url      = '/my-contacts/update';
            let ajaxData = {
                my_contact: serializedFormData
            };

            let dataProcessorsDto            = new DataProcessorDto();
            dataProcessorsDto.url            = url;
            dataProcessorsDto.successMessage = successMessage;
            dataProcessorsDto.failMessage    = failMessage;
            dataProcessorsDto.ajaxData       = ajaxData;

            return dataProcessorsDto;
        },
        makeCopyData($baseElement?: JQuery<HTMLElement>): DataProcessorDto | null {
            return null;
        },
        processorName: "Contact"
    };

    public static MyContactGroup: DataProcessorInterface = {
        makeCopyData($baseElement?: JQuery<HTMLElement>): DataProcessorDto | null {
            return null;
        },
        makeUpdateData($baseElement?: JQuery<HTMLElement>): DataProcessorDto | null {
            let id     = $($baseElement).find('.id').html();
            let name   = $($baseElement).find('.name').html();
            let icon   = $($baseElement).find('.icon').html();
            let color  = $($baseElement).find('.color').text();

            let successMessage = AbstractAction.messages.entityUpdateSuccess(Entity.MyContactGroup.processorName);
            let failMessage    = AbstractAction.messages.entityUpdateFail(Entity.MyContactGroup.processorName);

            let url      = '/my-contacts-groups/update';
            let ajaxData = {
                'name'      : name,
                'color'     : color,
                'icon'      : icon,
                'id'        : id
            };

            let dataProcessorsDto            = new DataProcessorDto();
            dataProcessorsDto.url            = url;
            dataProcessorsDto.successMessage = successMessage;
            dataProcessorsDto.failMessage    = failMessage;
            dataProcessorsDto.ajaxData       = ajaxData;

            return dataProcessorsDto;
        },
        makeRemoveData($baseElement?: JQuery<HTMLElement>): DataProcessorDto | null {
            let id              = $($baseElement).find('.id').html();
            let name            = $($baseElement).find('.name').html();
            let url             = '/my-contacts-groups/remove';
            let successMessage  = AbstractAction.messages.entityRemoveSuccess(Entity.MyContactGroup.processorName);
            let failMessage     = AbstractAction.messages.entityRemoveFail(Entity.MyContactGroup.processorName);
            let confirmMessage  = 'You are about to remove group named <b>' + name + ' </b>. There might be contact connected with it. Are You 100% sure? This might break something...';
            let ajaxData        = {
                id: id
            };

            let dataProcessorsDto                = new DataProcessorDto();
            dataProcessorsDto.url                = url;
            dataProcessorsDto.successMessage     = successMessage;
            dataProcessorsDto.failMessage        = failMessage;
            dataProcessorsDto.ajaxData           = ajaxData;
            dataProcessorsDto.isDataTable        = false;
            dataProcessorsDto.confirmMessage     = confirmMessage;
            dataProcessorsDto.useAjaxFailMessage = true;

            return dataProcessorsDto;
        },
        makeCreateData($baseElement?: JQuery<HTMLElement>): DataProcessorDto | null {
            let url = '/my-contacts-settings';
            let successMessage = AbstractAction.messages.entityCreatedRecordSuccess(Entity.MyContactGroup.processorName);
            let failMessage    = AbstractAction.messages.entityCreatedRecordFail(Entity.MyContactGroup.processorName);

            let dataProcessorsDto            = new DataProcessorDto();
            dataProcessorsDto.url            = url;
            dataProcessorsDto.successMessage = successMessage;
            dataProcessorsDto.failMessage    = failMessage;

            return dataProcessorsDto;
        },
        processorName: "Contact group",
    };

    public static MyPasswords: DataProcessorInterface = {
        makeUpdateData($baseElement?: JQuery<HTMLElement>): DataProcessorDto | null {
            let id              = $($baseElement).find('.id').html().trim();
            let login           = $($baseElement).find('.login').html().trim();
            let password        = $($baseElement).find('.password').html().trim();
            let url             = $($baseElement).find('.url').html().trim();
            let description     = $($baseElement).find('.description').html().trim();
            let groupId         = <string> $($baseElement).find('.group :selected').val();
            let trimmedGroupId  = groupId.trim();

            let successMessage    = AbstractAction.messages.entityUpdateSuccess(Entity.MyPasswords.processorName);
            let failMessage       = AbstractAction.messages.entityUpdateFail(Entity.MyPasswords.processorName);
            let invokedAlertBody  = '<b>WARNING</b>! You are about to save Your password. There is NO comming back. If You click save now with all stars **** in the password field then stars will be Your new password!';

            let ajaxUrl  = '/my-passwords/update/';
            let ajaxData = {
                'id'          : id,
                'password'    : password,
                'login'       : login,
                'url'         : url,
                'description' : description,
                'group'       : {
                    "type"        : "entity",
                    'namespace'   : EntityStructure.MyPasswordsGroups.getNamespace(),
                    'id'          : trimmedGroupId,
                },
            };

            let dataProcessorsDto              = new DataProcessorDto();
            dataProcessorsDto.url              = ajaxUrl;
            dataProcessorsDto.successMessage   = successMessage;
            dataProcessorsDto.failMessage      = failMessage;
            dataProcessorsDto.ajaxData         = ajaxData;
            dataProcessorsDto.invokeAlert      = true;
            dataProcessorsDto.invokedAlertBody = invokedAlertBody;

            return dataProcessorsDto;
        },
        makeRemoveData($baseElement?: JQuery<HTMLElement>): DataProcessorDto | null {
            let id              = $($baseElement).find('.id').html();
            let url             = '/my-passwords/remove/';
            let successMessage  = AbstractAction.messages.entityRemoveSuccess(Entity.MyPasswords.processorName);
            let failMessage     = AbstractAction.messages.entityRemoveFail(Entity.MyPasswords.processorName);

            let ajaxData       = {
                id: id
            };

            let dataProcessorsDto            = new DataProcessorDto();
            dataProcessorsDto.url            = url;
            dataProcessorsDto.successMessage = successMessage;
            dataProcessorsDto.failMessage    = failMessage;
            dataProcessorsDto.ajaxData       = ajaxData;
            dataProcessorsDto.isDataTable    = false;

            return dataProcessorsDto;

        },
        makeCreateData($baseElement?: JQuery<HTMLElement>): DataProcessorDto | null {
            let url             = '/my-passwords';
            let successMessage  = AbstractAction.messages.entityCreatedRecordSuccess(Entity.MyPasswords.processorName);
            let failMessage     = AbstractAction.messages.entityCreatedRecordFail(Entity.MyPasswords.processorName);

            let dataProcessorsDto            = new DataProcessorDto();
            dataProcessorsDto.url            = url;
            dataProcessorsDto.successMessage = successMessage;
            dataProcessorsDto.failMessage    = failMessage;

            return dataProcessorsDto;
        },
        makeCopyData($baseElement): DataProcessorDto | null  {
            let url     = '/my-passwords/get-password/';
            let id      = $($baseElement).find('.id').html();
            let ajaxUrl = url + id;

            let dataProcessorsDto            = new DataProcessorDto();
            dataProcessorsDto.url            = ajaxUrl;
            dataProcessorsDto.successMessage = AbstractAction.messages.password_copy_confirmation_message;
            dataProcessorsDto.failMessage    = AbstractAction.messages.default_copy_data_fail_message;

            return dataProcessorsDto;
        },
        processorName: "Password",
    };

    public static MyPasswordsGroups: DataProcessorInterface = {
        makeCopyData($baseElement?: JQuery<HTMLElement>): DataProcessorDto | null {
            return null;
        },
        makeUpdateData($baseElement?: JQuery<HTMLElement>): DataProcessorDto | null {
            let id   = $($baseElement).find('.id').html();
            let name = $($baseElement).find('.name').html();

            let successMessage  = AbstractAction.messages.entityUpdateSuccess(Entity.MyPasswordsGroups.processorName);
            let failMessage     = AbstractAction.messages.entityUpdateFail(Entity.MyPasswordsGroups.processorName);

            let url      = '/my-passwords-groups/update';
            let ajaxData = {
                'name': name,
                'id': id
            };

            let dataProcessorsDto            = new DataProcessorDto();
            dataProcessorsDto.url            = url;
            dataProcessorsDto.successMessage = successMessage;
            dataProcessorsDto.failMessage    = failMessage;
            dataProcessorsDto.ajaxData       = ajaxData;

            return dataProcessorsDto;
        },
        makeRemoveData($baseElement?: JQuery<HTMLElement>): DataProcessorDto | null {
            let id              = $($baseElement).find('.id').html();
            let name            = $($baseElement).find('.name').html();
            let url             = '/my-passwords-groups/remove';
            let successMessage = AbstractAction.messages.entityRemoveSuccess(Entity.MyPasswordsGroups.processorName);
            let failMessage    = AbstractAction.messages.entityRemoveFail(Entity.MyPasswordsGroups.processorName);
            let confirmMessage = 'You are about to remove group named <b>' + name + ' </b>. There might be password connected with it. Are You 100% sure? This might break something...';
            let ajaxData       = {
                id: id
            };

            let dataProcessorsDto            = new DataProcessorDto();
            dataProcessorsDto.url            = url;
            dataProcessorsDto.successMessage = successMessage;
            dataProcessorsDto.confirmMessage = confirmMessage;
            dataProcessorsDto.failMessage    = failMessage;
            dataProcessorsDto.ajaxData       = ajaxData;
            dataProcessorsDto.isDataTable    = false;

            return dataProcessorsDto;
        },
        makeCreateData($baseElement?: JQuery<HTMLElement>): DataProcessorDto | null {
            let url = '/my-passwords-settings';
            let successMessage = AbstractAction.messages.entityCreatedRecordSuccess(Entity.MyPasswordsGroups.processorName);
            let failMessage = AbstractAction.messages.entityCreatedRecordFail(Entity.MyPasswordsGroups.processorName);

            let dataProcessorsDto            = new DataProcessorDto();
            dataProcessorsDto.url            = url;
            dataProcessorsDto.successMessage = successMessage;
            dataProcessorsDto.failMessage    = failMessage;

            return dataProcessorsDto;
        },
        processorName: "Password group"
    };

    public static MyGoals: DataProcessorInterface = {
        makeCopyData($baseElement?: JQuery<HTMLElement>): DataProcessorDto | null {
            return null;
        },
        makeUpdateData($baseElement?: JQuery<HTMLElement>): DataProcessorDto | null {
            let id                          = $($baseElement).find('.id').html();
            let name                        = $($baseElement).find('.name').html();
            let description                 = $($baseElement).find('.description').html();
            let displayOnDashboardCheckbox  = $($baseElement).find('.displayOnDashboard');
            let displayOnDashboard          = $(displayOnDashboardCheckbox).prop("checked");

            let successMessage     = AbstractAction.messages.entityUpdateSuccess(Entity.MyGoals.processorName);
            let failMessage        = AbstractAction.messages.entityUpdateFail(Entity.MyGoals.processorName);

            let url = '/admin/goals/settings/update';
            let ajaxData = {
                'name'               : name,
                'description'        : description,
                'id'                 : id,
                'displayOnDashboard' : displayOnDashboard,
            };

            let dataProcessorsDto            = new DataProcessorDto();
            dataProcessorsDto.url            = url;
            dataProcessorsDto.ajaxData       = ajaxData;
            dataProcessorsDto.successMessage = successMessage;
            dataProcessorsDto.failMessage    = failMessage;

            return dataProcessorsDto;
        },
        makeRemoveData($baseElement?: JQuery<HTMLElement>): DataProcessorDto | null {
            let id             = $($baseElement).find('.id').html();
            let name           = $($baseElement).find('.name').html();
            let url            = '/admin/goals/settings/remove';
            let successMessage = AbstractAction.messages.entityRemoveSuccess(Entity.MyGoals.processorName);
            let failMessage    = AbstractAction.messages.entityRemoveFail(Entity.MyGoals.processorName);
            let confirmMessage = 'You are about to remove goal named <b>' + name + ' </b>. There might be subgoal connected with it. Are You 100% sure? This might break something...';
            let ajaxData       = {
                id: id
            };

            let dataProcessorsDto            = new DataProcessorDto();
            dataProcessorsDto.url            = url;
            dataProcessorsDto.ajaxData       = ajaxData;
            dataProcessorsDto.successMessage = successMessage;
            dataProcessorsDto.confirmMessage = confirmMessage;
            dataProcessorsDto.failMessage    = failMessage;
            dataProcessorsDto.isDataTable    = false;

            return dataProcessorsDto;
        },
        makeCreateData($baseElement?: JQuery<HTMLElement>): DataProcessorDto | null {
            let url             = '/admin/goals/settings/MyGoals';
            let successMessage  = AbstractAction.messages.entityCreatedRecordSuccess(Entity.MyGoals.processorName);
            let failMessage     = AbstractAction.messages.entityCreatedRecordFail(Entity.MyGoals.processorName);

            let dataProcessorsDto            = new DataProcessorDto();
            dataProcessorsDto.url            = url;
            dataProcessorsDto.successMessage = successMessage;
            dataProcessorsDto.failMessage    = failMessage;

            return dataProcessorsDto;
        },
        processorName: "Goal"
    };

    public static MySubgoals: DataProcessorInterface = {
        makeCopyData($baseElement?: JQuery<HTMLElement>): DataProcessorDto | null {
            return null;
        },
        makeUpdateData($baseElement?: JQuery<HTMLElement>): DataProcessorDto | null {
            let id            = $($baseElement).find('.id').html();
            let name          = $($baseElement).find('.name').html();
            let goalId        = <string> $($baseElement).find('.goal :selected').val();
            let trimmedGoalId = goalId.trim();

            let successMessage = AbstractAction.messages.entityUpdateSuccess(Entity.MySubgoals.processorName);
            let failMessage = AbstractAction.messages.entityUpdateFail(Entity.MySubgoals.processorName);

            let url = '/admin/subgoals/settings/update';
            let ajaxData = {
                'id'        : id,
                'name'      : name,
                'myGoal'    : {
                    "type"      : "entity",
                    'namespace' : EntityStructure.MyGoals.getNamespace(),
                    'id'        : trimmedGoalId,
                },
            };

            let dataProcessorsDto            = new DataProcessorDto();
            dataProcessorsDto.url            = url;
            dataProcessorsDto.successMessage = successMessage;
            dataProcessorsDto.failMessage    = failMessage;
            dataProcessorsDto.ajaxData       = ajaxData;

            return dataProcessorsDto;
        },
        makeRemoveData($baseElement?: JQuery<HTMLElement>): DataProcessorDto | null {
            let id = $($baseElement).find('.id').html();
            let url = '/admin/subgoals/settings/remove';
            let successMessage = AbstractAction.messages.entityRemoveSuccess(Entity.MySubgoals.processorName);
            let failMessage = AbstractAction.messages.entityRemoveFail(Entity.MySubgoals.processorName);

            let ajaxData       = {
                id: id
            };

            let dataProcessorsDto            = new DataProcessorDto();
            dataProcessorsDto.url            = url;
            dataProcessorsDto.successMessage = successMessage;
            dataProcessorsDto.failMessage    = failMessage;
            dataProcessorsDto.ajaxData       = ajaxData;
            dataProcessorsDto.isDataTable    = false;

            return dataProcessorsDto;
        },
        makeCreateData($baseElement?: JQuery<HTMLElement>): DataProcessorDto | null {
            let url = '/admin/goals/settings/MySubgoals';
            let successMessage = AbstractAction.messages.entityCreatedRecordSuccess(Entity.MySubgoals.processorName);
            let failMessage = AbstractAction.messages.entityCreatedRecordFail(Entity.MySubgoals.processorName);

            let dataProcessorsDto            = new DataProcessorDto();
            dataProcessorsDto.url            = url;
            dataProcessorsDto.successMessage = successMessage;
            dataProcessorsDto.failMessage    = failMessage;

            return dataProcessorsDto;
        },
        processorName: "Subgoal"
    };

    public static MyGoalsPayments: DataProcessorInterface = {
        makeCopyData($baseElement?: JQuery<HTMLElement>): DataProcessorDto | null {
            return null;
        },
        makeUpdateData($baseElement?: JQuery<HTMLElement>): DataProcessorDto | null {
            let id                          = $($baseElement).find('.id').html();
            let name                        = $($baseElement).find('.name').html();
            let deadline                    = $($baseElement).find('.deadline input').val();
            let collectionStartDate         = $($baseElement).find('.collectionStartDate input').val();
            let moneyGoal                   = $($baseElement).find('.moneyGoal').html();
            let moneyCollected              = $($baseElement).find('.moneyCollected').html();
            let displayOnDashboardCheckbox  = $($baseElement).find('.displayOnDashboard');
            let displayOnDashboard          = $(displayOnDashboardCheckbox).prop("checked");

            let successMessage             = AbstractAction.messages.entityUpdateSuccess(Entity.MyGoalsPayments.processorName);
            let failMessage                = AbstractAction.messages.entityUpdateFail(Entity.MyGoalsPayments.processorName);

            let url      = '/admin/goals/payments/settings/update';
            let ajaxData = {
                'id'                        : id,
                'name'                      : name,
                'deadline'                  : deadline,
                'collectionStartDate'       : collectionStartDate,
                'moneyGoal'                 : moneyGoal,
                'moneyCollected'            : moneyCollected,
                'displayOnDashboard'        : displayOnDashboard,
            };

            let dataProcessorsDto            = new DataProcessorDto();
            dataProcessorsDto.url            = url;
            dataProcessorsDto.successMessage = successMessage;
            dataProcessorsDto.failMessage    = failMessage;
            dataProcessorsDto.ajaxData       = ajaxData;

            return dataProcessorsDto;
        },
        makeRemoveData($baseElement?: JQuery<HTMLElement>): DataProcessorDto | null {
            let id                 = $($baseElement).find('.id').html();
            let url                = '/admin/goals/payments/settings/remove';
            let successMessage     = AbstractAction.messages.entityRemoveSuccess(Entity.MyGoalsPayments.processorName);
            let failMessage        = AbstractAction.messages.entityRemoveFail(Entity.MyGoalsPayments.processorName);
            let ajaxData           = {
                id: id
            };

            let dataProcessorsDto            = new DataProcessorDto();
            dataProcessorsDto.url            = url;
            dataProcessorsDto.successMessage = successMessage;
            dataProcessorsDto.failMessage    = failMessage;
            dataProcessorsDto.ajaxData       = ajaxData;
            dataProcessorsDto.isDataTable    = false;

            return dataProcessorsDto;
        },
        makeCreateData($baseElement?: JQuery<HTMLElement>): DataProcessorDto | null {
            let url                 = '/admin/goals/settings/MyGoalsPayments';
            let successMessage     = AbstractAction.messages.entityCreatedRecordSuccess(Entity.MyGoalsPayments.processorName);
            let failMessage        = AbstractAction.messages.entityCreatedRecordFail(Entity.MyGoalsPayments.processorName);

            let dataProcessorsDto            = new DataProcessorDto();
            dataProcessorsDto.url            = url;
            dataProcessorsDto.successMessage = successMessage;
            dataProcessorsDto.failMessage    = failMessage;

            return dataProcessorsDto;
        },
        processorName: "Goal payment"
    };

    public static MyFiles: DataProcessorInterface = {
        makeCreateData($baseElement?: JQuery<HTMLElement>): DataProcessorDto | null {
            return null;
        },
        makeCopyData($baseElement?: JQuery<HTMLElement>): DataProcessorDto | null {
            return null;
        },
        makeUpdateData($baseElement?: JQuery<HTMLElement>): DataProcessorDto | null {
            let subdirectory        = $($baseElement).find('input[name^="file_full_path"]').attr('data-subdirectory');
            let file_full_path      = $($baseElement).find('input[name^="file_full_path"]').val();
            let file_new_name       = $($baseElement).find('.file_name').text();

            let selectizeSelect     = $($baseElement).find('.tags');
                                      // @ts-ignore
            let tags                = $(selectizeSelect)[0].selectize.getValue();

            let url                 = '/api/my-files/update';

            let successMessage     = AbstractAction.messages.entityUpdateSuccess(Entity.MyFiles.processorName);
            let failMessage        = AbstractAction.messages.entityUpdateFail(Entity.MyFiles.processorName);

            let ajaxData = {
                'file_full_path' : file_full_path,
                'file_new_name'  : file_new_name,
                'subdirectory'   : subdirectory,
                'tags'           : tags,
            };

            let dataProcessorsDto            = new DataProcessorDto();
            dataProcessorsDto.url            = url;
            dataProcessorsDto.ajaxData       = ajaxData;
            dataProcessorsDto.successMessage = successMessage;
            dataProcessorsDto.failMessage    = failMessage;
            dataProcessorsDto.updateTemplate = true;

            return dataProcessorsDto;
        },
        makeRemoveData($baseElement?: JQuery<HTMLElement>): DataProcessorDto | null {
            let subdirectory        = $($baseElement).find('input[name^="file_full_path"]').attr('data-subdirectory');
            let file_full_path      = $($baseElement).find('input[name^="file_full_path"]').val();
            let url                 = '/my-files/remove-file';
            let ajaxData            = {
                'file_full_path'    : file_full_path,
                'subdirectory'      : subdirectory
            };

            let successMessage     = AbstractAction.messages.entityRemoveSuccess(Entity.MyFiles.processorName);
            let failMessage        = AbstractAction.messages.entityRemoveFail(Entity.MyFiles.processorName);

            let dataProcessorsDto            = new DataProcessorDto();
            dataProcessorsDto.url            = url;
            dataProcessorsDto.ajaxData       = ajaxData;
            dataProcessorsDto.successMessage = successMessage;
            dataProcessorsDto.failMessage    = failMessage;
            dataProcessorsDto.isDataTable    = true;

            return dataProcessorsDto;
        },
        processorName: "File"
    };

    public static MyPaymentsBillsItems: DataProcessorInterface = {
        makeCreateData($baseElement?: JQuery<HTMLElement>): DataProcessorDto | null {
            return null;
        },
        makeCopyData($baseElement?: JQuery<HTMLElement>): DataProcessorDto | null {
            return null;
        },
        makeUpdateData($baseElement?: JQuery<HTMLElement>): DataProcessorDto | null {
            let id      = $($baseElement).find('.id').html();
            let amount  = $($baseElement).find('.amount').html();
            let name    = $($baseElement).find('.name').html();

            let successMessage = AbstractAction.messages.entityUpdateSuccess(Entity.MyPaymentsBillsItems.processorName);
            let failMessage    = AbstractAction.messages.entityUpdateFail(Entity.MyPaymentsBillsItems.processorName);

            let url = '/my-payments-bills/update-bill-item/';
            let ajaxData = {
                'id'    : id,
                'amount': amount,
                'name'  : name
            };

            let dataProcessorsDto            = new DataProcessorDto();
            dataProcessorsDto.url            = url;
            dataProcessorsDto.successMessage = successMessage;
            dataProcessorsDto.failMessage    = failMessage;
            dataProcessorsDto.ajaxData       = ajaxData;

            return dataProcessorsDto;
        },
        makeRemoveData($baseElement?: JQuery<HTMLElement>): DataProcessorDto | null {
            let id                 = $($baseElement).find('.id').html();
            let url                = '/my-payments-bills/remove-bill-item/';
            let successMessage     = AbstractAction.messages.entityRemoveSuccess(Entity.MyPaymentsBillsItems.processorName);
            let failMessage        = AbstractAction.messages.entityRemoveFail(Entity.MyPaymentsBillsItems.processorName);
            let ajaxData           = {
                id : id
            };

            let dataProcessorsDto            = new DataProcessorDto();
            dataProcessorsDto.url            = url;
            dataProcessorsDto.successMessage = successMessage;
            dataProcessorsDto.failMessage    = failMessage;
            dataProcessorsDto.ajaxData       = ajaxData;
            dataProcessorsDto.isDataTable    = false;

            return dataProcessorsDto;
        },
        processorName: "Bill item"
    };

    public static MyPaymentsBills: DataProcessorInterface = {
        makeCreateData($baseElement?: JQuery<HTMLElement>): DataProcessorDto | null {
            return undefined;
        },
        makeCopyData($baseElement?: JQuery<HTMLElement>): DataProcessorDto | null {
            return null;
        },
        makeUpdateData($baseElement?: JQuery<HTMLElement>): DataProcessorDto | null {
            let id              = $($baseElement).find('.id').html();
            let name            = $($baseElement).find('.name').html();
            let information     = $($baseElement).find('.information').html();
            let startDate       = $($baseElement).find('.startDate').val();
            let endDate         = $($baseElement).find('.endDate').val();
            let plannedAmount   = $($baseElement).find('.plannedAmount').html();

            let successMessage = AbstractAction.messages.entityUpdateSuccess(Entity.MyPaymentsBills.processorName);
            let failMessage    = AbstractAction.messages.entityUpdateFail(Entity.MyPaymentsBills.processorName);

            let url = '/my-payments-bills/update-bill/';
            let ajaxData = {
                'id'            : id,
                'plannedAmount' : plannedAmount,
                'startDate'     : startDate,
                'endDate'       : endDate,
                'name'          : name,
                'information'   : information
            };

            let dataProcessorsDto            = new DataProcessorDto();
            dataProcessorsDto.url            = url;
            dataProcessorsDto.successMessage = successMessage;
            dataProcessorsDto.failMessage    = failMessage;
            dataProcessorsDto.ajaxData       = ajaxData;

            return dataProcessorsDto;
        },
        makeRemoveData($baseElement?: JQuery<HTMLElement>): DataProcessorDto | null {
            let id                  = $($baseElement).find('.id').html();
            let url                 = '/my-payments-bills/remove-bill/';
            let successMessage     = AbstractAction.messages.entityRemoveSuccess(Entity.MyPaymentsBills.processorName);
            let failMessage        = AbstractAction.messages.entityRemoveFail(Entity.MyPaymentsBills.processorName);
            let ajaxData           = {
                id : id
            };

            let dataProcessorsDto            = new DataProcessorDto();
            dataProcessorsDto.url            = url;
            dataProcessorsDto.successMessage = successMessage;
            dataProcessorsDto.failMessage    = failMessage;
            dataProcessorsDto.ajaxData       = ajaxData;
            dataProcessorsDto.isDataTable    = false;

            return dataProcessorsDto;
        },
        processorName: "Bill"
    };

    public static MyIssueContact: DataProcessorInterface = {
        makeCopyData($baseElement?: JQuery<HTMLElement>): DataProcessorDto | null {
            return null;
        },
        makeCreateData($baseElement?: JQuery<HTMLElement>): DataProcessorDto | null {
            let url                = '/my-issues/pending';
            let successMessage     = AbstractAction.messages.entityCreatedRecordSuccess(Entity.MyIssueContact.processorName);
            let failMessage        = AbstractAction.messages.entityCreatedRecordFail(Entity.MyIssueContact.processorName);
            let callbackAfter      = () => {
                BootboxWrapper.mainLogic.hideAll();
            };

            let dataProcessorsDto            = new DataProcessorDto();
            dataProcessorsDto.url            = url;
            dataProcessorsDto.successMessage = successMessage;
            dataProcessorsDto.failMessage    = failMessage;
            dataProcessorsDto.callbackAfter  = callbackAfter;

            return dataProcessorsDto;
        },
        makeUpdateData($baseElement?: JQuery<HTMLElement>): DataProcessorDto | null {
            let id              = $($baseElement).find('.id').html();
            let date            = $($baseElement).find('.date input').val();
            let information     = $($baseElement).find('.information').html();
            let icon            = $($baseElement).find('.icon').html();
            let callbackAfter   = () => {
                BootboxWrapper.mainLogic.hideAll();
            };

            let successMessage = AbstractAction.messages.entityUpdateSuccess(Entity.MyIssueContact.processorName);
            let failMessage    = AbstractAction.messages.entityUpdateFail(Entity.MyIssueContact.processorName);

            let url      = '/my-issues-contacts/update';
            let ajaxData = {
                'id'            : id,
                'date'          : date,
                'icon'          : icon,
                'information'   : information
            };

            let dataProcessorsDto            = new DataProcessorDto();
            dataProcessorsDto.url            = url;
            dataProcessorsDto.ajaxData       = ajaxData;
            dataProcessorsDto.successMessage = successMessage;
            dataProcessorsDto.failMessage    = failMessage;
            dataProcessorsDto.callbackAfter  = callbackAfter;

            return dataProcessorsDto;
        },
        makeRemoveData($baseElement?: JQuery<HTMLElement>): DataProcessorDto | null {
            let id                 = $($baseElement).find('.id').html();
            let url                = '/my-issues-contacts/remove';
            let successMessage     = AbstractAction.messages.entityRemoveSuccess(Entity.MyIssueContact.processorName);
            let failMessage        = AbstractAction.messages.entityRemoveFail(Entity.MyIssueContact.processorName);
            let ajaxData           = {
                id:id
            };
            let callbackAfter      = () => {
                BootboxWrapper.mainLogic.hideAll();
            };

            let dataProcessorsDto            = new DataProcessorDto();
            dataProcessorsDto.url            = url;
            dataProcessorsDto.ajaxData       = ajaxData;
            dataProcessorsDto.successMessage = successMessage;
            dataProcessorsDto.failMessage    = failMessage;
            dataProcessorsDto.callbackAfter  = callbackAfter;
            dataProcessorsDto.isDataTable    = false;

            return dataProcessorsDto;
        },
        processorName: "Issue contact"
    };

    public static MyIssueProgress: DataProcessorInterface = {
        makeRemoveData($baseElement?: JQuery<HTMLElement>): DataProcessorDto | null {
            return null;
        },
        makeCopyData($baseElement?: JQuery<HTMLElement>): DataProcessorDto | null {
            return null;
        },
        makeCreateData($baseElement?: JQuery<HTMLElement>): DataProcessorDto | null {
            let url                = '/my-issues/pending';
            let successMessage     = AbstractAction.messages.entityCreatedRecordSuccess(Entity.MyIssueProgress.processorName);
            let failMessage        = AbstractAction.messages.entityCreatedRecordFail(Entity.MyIssueProgress.processorName);
            let callbackAfter      = () => {
                BootboxWrapper.mainLogic.hideAll();
            };

            let dataProcessorsDto            = new DataProcessorDto();
            dataProcessorsDto.url            = url;
            dataProcessorsDto.successMessage = successMessage;
            dataProcessorsDto.failMessage    = failMessage;
            dataProcessorsDto.callbackAfter  = callbackAfter;
            dataProcessorsDto.isDataTable    = false;

            return dataProcessorsDto;
        },
        makeUpdateData($baseElement?: JQuery<HTMLElement>): DataProcessorDto | null {
            let $tinymceWrapper         = $($baseElement).find('[data-id="tiny-mce-wrapper"]');
            let tinymceInstanceSelector = $tinymceWrapper.attr('id');
            let tinymceContent          = TinyMce.getTextContentForTinymceIdSelector(tinymceInstanceSelector);

            let id              = $($baseElement).find('.id').text();
            let information     = tinymceContent;

            let successMessage = AbstractAction.messages.entityUpdateSuccess(Entity.MyIssueProgress.processorName);
            let failMessage    = AbstractAction.messages.entityUpdateFail(Entity.MyIssueProgress.processorName);

            let url = '/my-issues-progress/update';
            let ajaxData = {
                'id'          : id,
                'information' : information
            };

            let callbackAfter = () => {
                BootboxWrapper.mainLogic.hideAll();
            };

            let dataProcessorsDto            = new DataProcessorDto();
            dataProcessorsDto.url            = url;
            dataProcessorsDto.ajaxData       = ajaxData;
            dataProcessorsDto.successMessage = successMessage;
            dataProcessorsDto.failMessage    = failMessage;
            dataProcessorsDto.callbackAfter  = callbackAfter;

            return dataProcessorsDto;
        },
        processorName: "Issue progress"
    };

}