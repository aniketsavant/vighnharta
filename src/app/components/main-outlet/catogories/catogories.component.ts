import { Component, OnInit, ViewChild } from '@angular/core';
import { AlertConfig } from 'ngx-bootstrap/alert';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader'; // Import NgxUiLoaderService

import { CategoryService } from '../../../services/category.service';
import { CONSTANT } from '../../../constants/constants';
import {
  ModelValue,
  GetCategoryList,
  Category,
  SubCategory,
} from '../../../interfaces/iCategory';

export function getAlertConfig(): AlertConfig {
  return Object.assign(new AlertConfig(), { type: 'success' });
}

@Component({
  selector: 'app-catogories',
  templateUrl: './catogories.component.html',
  styleUrls: ['./catogories.component.scss'],
  providers: [{ provide: AlertConfig, useFactory: getAlertConfig }],
})
export class CatogoriesComponent implements OnInit {
  @ViewChild('modelForAddEditCategory')
  public modelForAddEditCategory: ModalDirective;
  @ViewChild('modelForAddEditSubCategory')
  public modelForAddEditSubCategory: ModalDirective;
  public modelValues: ModelValue = {
    modelClass: '',
    modelTitle: '',
    saveButtonName: '',
    saveButtonClass: '',
    name: '',
    discription: '',
  };
  public isSubCategoryForm: boolean = false;
  public addMainCategoryForm: FormGroup;
  public addSubCategoryForm: FormGroup;
  public allCategoryList: Category[] = [];
  public filteredCatCopy: Category[] = [];
  public isSubCategoryShow = false;
  public arrSubCategoryList: SubCategory[];
  public editMainCategory: any;
  public isEditForm = false;
  public subCategoryList: any;
  public filteredSubCategoryList: any;
  public selectedCategoryId: string;
  public selectedCatName: string = '';
  public searchValue: string = '';
  public cityList: Array<Object> = [];

  constructor(
    private formBuilder: FormBuilder,
    private toastr: ToastrService,
    private categoryService: CategoryService,
    private ngxLoader: NgxUiLoaderService
  ) {}

  ngOnInit(): void {
    // this.ngxLoader.start();
    this.addMainCategoryForm = this.formBuilder.group({
      categoryId: [''],
      categoryName: [''],
      categoryDiscription: [''],
      city_name: [''],
      categoryImage: ['', Validators.required],
      categoryImageFileSource: [''],
    });
    this.addSubCategoryForm = this.formBuilder.group({
      subCategoryId: [''],
      selectedcategoryId: ['', Validators.required],
      subCategoryName: [''],
      subCategoryDiscription: [''],
      subCategoryImage: ['', Validators.required],
      subCategoryImageFileSource: [''],
    });
    this.getCities();
    this.getCategoryList();
  }

  private getCities(){
    this.categoryService
    .getCityList()
    .subscribe((res: any) => {
      if (res.status === 'Ok') {
        this.cityList = res.data;
      } else {
        this.toastr.error('Somthing wrong', 'Oops.!!');
      }
    }),
    (err) => {
      this.toastr.error('Somthing wrong', 'Oops.!!');
      this.ngxLoader.stop();
    };
  }


  private getCategoryList(): void {
    this.categoryService
      .getAllCategoryListCall()
      .subscribe((res: GetCategoryList) => {
        if (res.status === 'Ok') {
          this.allCategoryList = res.data;
          this.assignCatCopy();
          this.ngxLoader.stop();
        } else {
          this.toastr.error('Somthing wrong', 'Oops.!!');
          this.ngxLoader.stop();
        }
      }), 
      (err) => {
        this.toastr.error('Somthing wrong', 'Oops.!!');
        console.log('Error', err);
        this.ngxLoader.stop();
      };
  }

  public onAddCategoryClick(): void {
    this.modelValues = CONSTANT.FOR_CATEGORY_SAVE;
    this.modelForAddEditCategory.show();
  }

  public onAddSubCategoryClick(): void {
    this.isSubCategoryForm = true;
    this.modelValues = CONSTANT.FOR_SUB_CATEGORY_SAVE;
    this.modelForAddEditSubCategory.show();
  }

  public onEditCategoryClick(objCategory): void {
    this.isEditForm = true;
    this.modelValues = CONSTANT.FOR_CATEGORY_EDIT;
    this.addMainCategoryForm
      .get('categoryId')
      .patchValue(objCategory.category_id);
    this.addMainCategoryForm
      .get('categoryName')
      .patchValue(objCategory.category_name);
    this.addMainCategoryForm
      .get('categoryDiscription')
      .patchValue(objCategory.category_description);
    this.addMainCategoryForm
      .get('city_name')
      .patchValue(objCategory.city_name);
    this.addMainCategoryForm.controls['categoryName'].updateValueAndValidity();
    this.addMainCategoryForm.controls[
      'categoryDiscription'
    ].updateValueAndValidity();

    this.modelForAddEditCategory.show();
  }

  public onEditSubCategoryClick(objCategory, categoryId): void {
    console.log(objCategory, categoryId);
    this.isEditForm = true;
    this.modelValues = CONSTANT.FOR_SUB_CATEGORY_EDIT;
    this.addSubCategoryForm.get('selectedcategoryId').patchValue(categoryId);
    this.addSubCategoryForm
      .get('subCategoryId')
      .patchValue(objCategory.subcategory_id);
    this.addSubCategoryForm
      .get('subCategoryName')
      .patchValue(objCategory.subcategory_name);
    this.addSubCategoryForm
      .get('subCategoryDiscription')
      .patchValue(objCategory.subcategory_description);
    this.addSubCategoryForm.controls[
      'subCategoryName'
    ].updateValueAndValidity();
    this.addSubCategoryForm.controls[
      'subCategoryDiscription'
    ].updateValueAndValidity();

    this.modelForAddEditSubCategory.show();
  }

  public onMainCategoryCloseClick(): void {
    this.modelForAddEditCategory.hide();
    this.addMainCategoryForm.reset();
  }

  public onSubCategoryCloseClick(): void {
    this.modelForAddEditSubCategory.hide();
    this.addSubCategoryForm.reset();
  }

  public onAddEditMainCategoryClick(): void {
    this.ngxLoader.start();
    if (this.isEditForm) {
      this.categoryService
        .editCategoryCall(this.createFormData())
        .subscribe((res) => {
          if (res.status !== 'error') {
            this.toastr.success('Category edited successfully.', 'Done.!!');
            this.getCategoryList();
            this.onMainCategoryCloseClick();
            this.ngxLoader.stop();
          } else {
            this.toastr.error(res.message, 'Oops.!!');
            this.ngxLoader.stop();
          }
        }),
        (err) => {
          this.toastr.error('Somthing wrong', 'Oops.!!');
          console.log('Error', err);
          this.ngxLoader.stop();
        };
    } else {
      this.categoryService
        .createCategoryCall(this.createFormData())
        .subscribe((res) => {
          if (res.status !== 'error') {
            this.toastr.success('Category added successfully.', 'Done.!!');
            this.getCategoryList();
            this.onMainCategoryCloseClick();
            this.ngxLoader.stop();
          } else {
            this.toastr.error(res.message, 'Oops.!!');
            this.ngxLoader.stop();
          }
        }),
        (err) => {
          this.toastr.error('Somthing wrong', 'Oops.!!');
          console.log('Error', err);
          this.ngxLoader.stop();
        };
    }
  }

  public onAddEditSubCategoryClick(): void {
    this.ngxLoader.start();
    if (this.isEditForm) {
      this.categoryService
        .editSubCategoryCall(this.createFormData())
        .subscribe((res) => {
          if (res.status !== 'error') {
            this.toastr.success('Sub category edited successfully.', 'Done.!!');
            this.getCategoryList();
            this.onSubCategoryCloseClick();
            this.ngxLoader.stop();
          } else {
            this.toastr.error(res.message, 'Oops.!!');
            this.ngxLoader.stop();
          }
        }),
        (err) => {
          this.toastr.error('Somthing wrong', 'Oops.!!');
          console.log('Error', err);
          this.ngxLoader.stop();
        };
    } else {
      this.categoryService
        .createSubCaegoryCall(this.createFormData())
        .subscribe((res) => {
          if (res.status !== 'error') {
            this.toastr.success('Sub category added successfully.', 'Done.!!');
            this.getCategoryList();
            this.onSubCategoryCloseClick();
            this.ngxLoader.stop();
          } else {
            this.toastr.error(res.message, 'Oops.!!');
            this.ngxLoader.stop();
          }
        }),
        (err) => {
          this.toastr.error('Somthing wrong', 'Oops.!!');
          console.log('Error', err);
          this.ngxLoader.stop();
        };
    }
  }

  onFileChange(event) {
    if (
      this.addMainCategoryForm.controls['categoryImage'].value !== '' &&
      this.addMainCategoryForm.controls['categoryImage'].value !== null &&
      this.addMainCategoryForm.controls['categoryImage'].value !== undefined
    ) {
      if (event.target.files.length > 0) {
        const file = event.target.files[0];
        this.addMainCategoryForm.patchValue({
          categoryImageFileSource: file,
        });
      }
    } else {
      if (event.target.files.length > 0) {
        const file = event.target.files[0];
        this.addSubCategoryForm.patchValue({
          subCategoryImageFileSource: file,
        });
      }
    }
  }

  private createFormData(): FormData {
    const formData = new FormData();
    if (
      this.addMainCategoryForm.controls['categoryImage'].value !== '' &&
      this.addMainCategoryForm.controls['categoryImage'].value !== null &&
      this.addMainCategoryForm.controls['categoryImage'].value !== undefined
    ) {
      if (this.isEditForm) {
        formData.append(
          'category_id',
          this.addMainCategoryForm.controls['categoryId'].value
        );
      }

      formData.append(
        'files',
        this.addMainCategoryForm.controls['categoryImageFileSource'].value
      );
      formData.append(
        'category_name',
        this.addMainCategoryForm.controls['categoryName'].value
      );
      formData.append(
        'description',
        this.addMainCategoryForm.controls['categoryDiscription'].value
      );
      formData.append(
        'city_name',
        this.addMainCategoryForm.controls['city_name'].value
      );
    } else {
      formData.append(
        'files',
        this.addSubCategoryForm.controls['subCategoryImageFileSource'].value
      );
      formData.append(
        'subcategory_name',
        this.addSubCategoryForm.controls['subCategoryName'].value
      );
      formData.append(
        'description',
        this.addSubCategoryForm.controls['subCategoryDiscription'].value
      );
      formData.append(
        'category_id',
        this.addSubCategoryForm.controls['selectedcategoryId'].value
      );
      if (this.isEditForm) {
        formData.append(
          'subcategory_id',
          this.addSubCategoryForm.controls['subCategoryId'].value
        );
      }
    }
    return formData;
  }

  public onMainCategoryClick(category) {
    const index = this.allCategoryList.findIndex(
      (x) => x.category_id === category.category_id
    );
    if (this.allCategoryList[index]?.subcategory.length === 1) {
      this.toastr.error(
        'No sub category available for this category',
        'NO DATA..!!'
      );
    } else {
      this.selectedCatName = this.allCategoryList[index].category_name;
      this.selectedCategoryId = this.allCategoryList[index].category_id;
      const tempForsubCatList = this.allCategoryList[index].subcategory;
      this.subCategoryList = tempForsubCatList.filter(
        ({ status }) => status !== '0'
      );
      this.searchValue = '';
      this.isSubCategoryShow = true;
      this.assignCatCopy();
    }
  }

  public onDeleteCategoryClick(cat): void {
    if (
      confirm(
        'Sub category and products related to this category will also deleted, if have any. Are you sure to delete -' +
          cat.category_name
      )
    ) {
      // this.ngxLoader.start();
      let params = { category_id: cat.category_id };
      console.log(params);
      this.categoryService.deleteCategoryCall(params).subscribe((res) => {
        if (res.status == 'Ok') {
          this.allCategoryList = this.allCategoryList.filter(
            ({ category_id }) => category_id !== cat.category_id
          );
          this.assignCatCopy();
          this.toastr.success('Category deleted successfully', 'Done.!!');
          // this.ngxLoader.stop();
        } else {
          this.toastr.error('Somthing wrong', 'Oops.!!');
          // this.ngxLoader.stop();
        }
      }),
        (err) => {
          this.toastr.error('Somthing wrong', 'Oops.!!');
          console.log('Error', err);
          // this.ngxLoader.stop();
        };
    }
  }

  public onDeleteSubCategoryClick(subCat): void {
    if (
      confirm(
        'Products related to this sub category will also deleted, if have any. Are you sure to delete ' +
          subCat.subcategory_name
      )
    ) {
      // this.ngxLoader.start();
      let params = { subcategory_id: subCat?.subcategory_id };
      console.log(params);
      this.categoryService.deleteSubCategoryCall(params).subscribe((res) => {
        if (res.status == 'Ok') {
          this.subCategoryList = this.subCategoryList.filter(
            ({ subcategory_id }) => subcategory_id !== subCat?.subcategory_id
          );
          this.assignCatCopy();
          if (this.subCategoryList.length === 0) this.backToCategoryList();
          this.toastr.error('Sub category deleted successfully', 'Done.!!');
          // this.ngxLoader.stop();
        } else {
          this.toastr.error('Somthing wrong', 'Oops.!!');
          // this.ngxLoader.stop();
        }
      }),
        (err) => {
          this.toastr.error('Somthing wrong', 'Oops.!!');
          console.log('Error', err);
          // this.ngxLoader.stop();
        };
    }
  }

  public backToCategoryList() {
    this.searchValue = '';
    this.isSubCategoryShow = false;
    this.assignCatCopy();
  }

  public applyFilter(value: string): void {
    if (!value) {
      this.assignCatCopy();
    }
    if (this.isSubCategoryShow) {
      this.filteredSubCategoryList = Object.assign(
        [],
        this.subCategoryList
      ).filter(
        (item) =>
          item.subcategory_name.toLowerCase().indexOf(value.toLowerCase()) > -1
      );
    } else {
      this.filteredCatCopy = Object.assign([], this.allCategoryList).filter(
        (item) =>
          item.category_name.toLowerCase().indexOf(value.toLowerCase()) > -1
      );
    }
  }

  assignCatCopy(): void {
    if (this.isSubCategoryShow) {
      this.filteredSubCategoryList = Object.assign([], this.subCategoryList);
    } else {
      this.filteredCatCopy = Object.assign([], this.allCategoryList);
    }
  }
}
