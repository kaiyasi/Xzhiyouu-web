// jQalert(contant, buttonDone)
// jQalert_and_reload(contant, buttonDone)
// jQconfirm_and_reload(contant, buttonDone, buttonFail)
// jQdirector_direct(contant, url, buttonDone)
// jQdirector_confirm(contant, urlforward, urlforcancel, buttonDone, buttonFail)


// jQprompt(contant)
// jQpromptSingleSelection(contant, selectionOptions, FunctionName, Extradata, buttonDone, buttonFail)


//jQalert_and_execution(contant, act, values, buttonDone)
//jQconfirm_and_execution(contant, act, values, buttonDone, buttonFail)
function jQexecution(act, values, execute) {
    if (typeof (execute) == "undefined") {
        execute = 1
    } else {
        if (execute) {
            execute = 1;
        } else {
            execute = 0;
        }
    }
    inhere = 0;
    switch (act) {
        case "DragAndDropUpload":
            if (execute) {
                Oddi_UploadAfterDrop(values[0], values[1]);
            } else {
            }
            break;
        case "DragAndDropUpload_boardsetting":
            if (execute) {
                Oddi_UploadAfterDrop(values[0], values[1], values[2]);
            } else {
            }
            break;
        case "GroupMember":
            groupMemberprocess(values[0], values[1], values[2]);
            break;
        case "setGroupChacter":
            groupMemberCharEdit(values[0], values[1], values[2]);
            break;
        //-----------------------------gre_CMS--------------------------------
        case "AccessbilityCheckGotNoMissing":
            if (!execute) {
                blockEscape();
            } else {
                location.href = hostplace + values;
            }
            break;
        case "AccessbilityCheckFillInAlready":
            if (!execute) {
                if ($("[data-id='SaveBtn']").length){
                    $("[data-id='SaveBtn']")[0].click();
                } else if ($("[data-id='NextStepBtn']").length) {
                    $("[data-id='NextStepBtn']")[0].click();
                } else if($("[id='NextStepBtn']").length) {
                    $("[id='NextStepBtn']")[0].click();
                }
            }
            break;
        case "AccessbilityCheckGotMissingButSkip":
            if (!execute) {
                location.href = hostplace + values;
            }
            break;
        case "FinishAccessibilityCheck":
            SaveAccessibilityData();
            break;
        case "FinishAccessibilityCheck_WYSIWYGEditor":
            $('#WYSIWYGEditor').submit();
            break;
        case "subwebChoose":
            if (execute) {
                location.href = hostplace + "#";
            } else {
                NodeTypeCancelChoose();
            }
            break;
        case "AbandonEdit":
            if (execute) {
                window.removeEventListener('beforeunload', Oddi_StopUnload_When_BeforeUnload_Fun);
                tableBuilderUnload();
                location.reload();
            }
            break;
        case "reOpenDataAdder":
            // block("附加資料", "addonItems");
            break;
        default:
    }
}

//jQconfirm(contant, act, extradata, buttonDone, buttonFail)
function jQconfirmRequirement(requirement, act, extradata) {
    inhere = 0;
    switch (act) {
        case 'SystemSetting_deflector':
            if (requirement) {
                ShowWarning = 0;
                $('[data-check="deflector"]')[0].click();
            } else {
                $('[data-edit="deflector"]')[0].click();
            }
            break;
        case "delAcc":
            if (requirement) {
                DisableAccount(extradata);
            }
            break;
        case "delnode":
            if (requirement) {
                delnode(extradata[0], extradata[1], extradata[2]);
            }
            break;
        case "delCategoryTag":
            if (requirement) {
                delCategoryTag(extradata[0], extradata[1]);
            }
            break;
        case "delBoardsettingMain":
            if (requirement) {
                extradata.remove();
            }
            break;
        case "BoardSetting_changeBlockType":
            if (requirement) {
                changeBlockContent_tools(extradata);
                ChangeBlockType(extradata);
                document.getElementById("selection_" + CurrentBlockUIFunction).innerHTML = "";
            } else {
                let inputElemants = extradata.parentNode.getElementsByTagName("input");
                for (let i = 0; i < inputElemants.length; i++) {
                    if (inputElemants[i].value == CurrentBlockType && inputElemants[i].type == "radio") {
                        SysAct = 1;
                        inputElemants[i].click();
                        SysAct = 0;
                        break;
                    }
                }
            }
            break;
        case "BoardSettingDelPic":
            if (requirement) {
                DelPicItem(extradata)
            }
            break;
        case "BoardSettingEdit":
            if (requirement) {
                switch (CurrentBlockUIFunction) {
                    case "Banner":
                        document.getElementById("Banner_cropper-image").src = location.href;
                        break;
                    default:

                }
                document.getElementById(CurrentBlockUIFunction + "_editor").style.display = "none";
                CurrentBlockUIFunction = "";
                switch (extradata) {
                    case "success":
                        blockuiSuccess();
                        break;
                    case "cancel":
                        blockuiCancel();
                        break;
                    default:
                        blockuiSuccess();
                }
            }
            break;
        case "ImgItemEditorSetDiffData":
            if (requirement) {
                ModifyImgItems(extradata[0], extradata[1], extradata[2]);
            }
            break;
        case "draganddropLogo":
            if (requirement) {
                Oddi_UploadAfterDrop(extradata[0], extradata[1], extradata[2]);
            }
            break;
        case "inputFileSelectLogo":
            if (requirement) {
                document.getElementById("ImgUpdater_Banner").click();
            }
            break;
        case "AccessbilityCheckerSaveClick":
            if (requirement) {
                $("[data-id='SaveBtn']")[0].click();
            }
            break;
        case "WYSIWYGEditorAccessbilityCheckerSaveClick":
            if (requirement) {
                $("#NextStepBtn")[0].click();
            }
            break;
        case "publishStatusModify":
            if (requirement) {
                publishStatusModify(extradata, 0)
            }
            break;
        case "RechooseCategorytype":
            if (requirement) {
                CurrentFunName = $("[data-id='CategoryType']")[0].value;
                show_tree(1);
                actnode = { "title": "", data: { "nodeid": "" } };
                initCategorySelector();
            } else {
                $("[data-id='CategoryType']")[0].value = CurrentFunName;
            }
            break;
        case 'newstransfer':
            if (requirement) {
                levelCategoryTransferToTag();
            }
            break;
        case "do-freeeditblockContentEdit":
            if (requirement) {
                $('[data-freeeditblock="{0}"]'.format(CurrentBlockId))[0].click();
            }
            break;
        case 'confirmChangeBlockType':
            if (requirement) {
                extradata.click();
            } else {
                for (var i = 0; i < document.getElementsByName('Nodetype').length; i++) {
                    try {
                        if (document.getElementsByName('Nodetype')[i].value == OriginCurrentBlockType){
                            PassWarning = 0;
                            document.getElementsByName('Nodetype')[i].checked = 1;
                        }
                    } catch (e) {
                        console.log(e);
                    }
                }
            }
            break;
        case 'exhibitionBlockEmpty':
            if (requirement) {
                exhibitionWarning = 0;
                blockuiSuccess();
            }
            break;
        default:
    }
    //inhere = 0;
}
