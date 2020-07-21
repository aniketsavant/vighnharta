import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CONSTANT } from '../../../../constants/constants';
import { AlertConfig } from 'ngx-bootstrap/alert';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ProductService } from './../../../../services/product.service';
import { CategoryService } from './../../../../services/category.service';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader'; // Import NgxUiLoaderService

export function getAlertConfig(): AlertConfig {
  return Object.assign(new AlertConfig(), { type: 'success' });
}
@Component({
  selector: 'app-add-product',
  templateUrl: './add-product.component.html',
  styleUrls: ['./add-product.component.scss'],
  providers: [{ provide: AlertConfig, useFactory: getAlertConfig }],
})
export class AddProductComponent implements OnInit {
  @Input('isEdit') public isEdit: boolean = false;
  @Input('productDetails') public productDetails: any;
  @Output('closeForm') public closeForm: EventEmitter<any> = new EventEmitter();
  public setProductValue: any = {
    saveButtonName: '',
    saveButtonClass: '',
    cardHeaderName: '',
  };
  public urls = new Array<string>();
  public productForm: FormGroup;
  public offerList = [];
  public allCategoryList: any = [];
  public allSubCategoryList: any = [];
  public productQtyUnit = CONSTANT.FOR_PRODUCT_UNIT;
  public discountRateUnit = CONSTANT.FOR_DISCOUNT_UNIT;
  public files = null;
  public offerEdit: boolean = false;
  public editOfferItemId: string = '';
  public maker_name_list: Array<string> = CONSTANT.MURTI_ART_NAME;
  constructor(
    private formBuilder: FormBuilder,
    private productService: ProductService,
    private categoryService: CategoryService,
    private toastr: ToastrService,
    private ngxLoader: NgxUiLoaderService
  ) {}

  ngOnInit(): void {
    this.productForm = this.formBuilder.group({
      productId: [''],
      productCategory: ['', Validators.required],
      productSubCategory: ['', Validators.required],
      productName: ['', Validators.required],
      productQuantity: ['100', Validators.required],
      productDescription: [''],
      productUnit: ['Unit', Validators.required],
      offerName: [''],
      offerProductQuantity: ['1'],
      offerProductUnit: ['Unit'],
      productPrice: ['', Validators.required],
      discountRate: [''],
      max_quantity: ['1'],
      discountRateUnit: [''],
      discountPrice: [''],
      image: ['', Validators.required],
      offerList: [''],
      maker_name: ['', Validators.required],
    });

    this.setProductValue = this.isEdit
      ? CONSTANT.FOR_PRODUCT_EDIT
      : CONSTANT.FOR_PRODUCT_SAVE;

    this.getAllCategory();
  }

  getAllCategory() {
    this.categoryService.getAllCategoryListCall().subscribe((res) => {
      if (res.status === 'Ok') {
        this.allCategoryList = res.data;
        if (this.isEdit && this.allCategoryList.length !== 0) {
          this.patchProductData(this.productDetails);
        }
      } else {
        this.toastr.error('Somthing wrong', 'Oops.!!');
      }
    }),
      (err) => {
        this.toastr.error('Somthing wrong', 'Oops.!!');
      };
  }
  get f() {
    return this.productForm.controls;
  }
  public onCloseClick(): void {
    if (this.isEdit) {
      this.closeForm.emit(true);
    }
  }

  public onSaveChangesClick(): void {
    if (this.isEdit) {
      this.editProductData();
    } else {
      this.addProductData();
    }
  }

  addProductData() {
    this.ngxLoader.start();
    this.productService
      .addProductCall(this.createAddProductPayload())
      .subscribe(
        (res) => {
          if (res.status === 'Ok') {
            this.uploadPhoto(res.Id);
            // this.ngxLoader.stop();
          } else {
            this.toastr.error('Something wrong', 'Oops.!!');
            this.ngxLoader.stop();
          }
        },
        (err) => {
          this.toastr.error('Something wrong', 'Oops.!!');
          this.ngxLoader.stop();
        }
      );
  }

  public uploadPhoto(prod_id): void {
    let temp_i = 0;
    let temp_file_length = this.files.length;
    for (let i = 0; i <= this.files.length; i++) {
      let formData = new FormData();
      console.log(this.files[i]);
      formData.append(
        'files',
        this.files[i],
        +new Date() + '.' + this.files[i].name.split('.')[1]
      );
      formData.append('product_id', prod_id);
      this.productService.uploadImageCall(formData).subscribe(
        (res) => {
          if (res.status === 'error') {
            temp_i = temp_i + 1;
            if (temp_i === temp_file_length) {
              this.toastr.error('Something wrong', 'Oops.!!');
              this.ngxLoader.stop();
            }
          } else {
            temp_i = temp_i + 1;
            if (temp_i === temp_file_length) {
              this.ngxLoader.stop();
              this.toastr.success(
                'Product Added Successfully.',
                'Done.!!'
              );
            }
            this.productForm.reset();
            this.productForm.patchValue({
              productCategory: '',
              productSubCategory: '',
              productUnit: 'Unit',
              offerProductUnit: 'Unit',
              offerProductQuantity: '1',
              productQuantity: '100',
              max_quantity: '1',
              discountRateUnit: '',
            });
            this.offerList = [];
            this.urls = [];
            this.closeForm.emit(true);
          }
        },
        (err) => {
          this.toastr.error('Something wrong', 'Oops.!!');
          temp_i = temp_i + 1;
          if (temp_i === temp_file_length) {
            this.ngxLoader.stop();
          }
        }
      );
    }
  }

  editProductData() {
    this.ngxLoader.start();
    this.productService
      .editProductCall(this.createAddProductPayload())
      .subscribe(
        (res) => {
          if (res.status === 'Ok') {
            if (this.files) {
              let temp_i = 0;
              let temp_file_length = this.files.length;
              for (let i = 0; i <= this.files.length; i++) {
                let formData = new FormData();
                console.log(this.files[i]);
                formData.append(
                  'files',
                  this.files[i],
                  +new Date() + '.' + this.files[i].name.split('.')[1]
                );
                formData.append(
                  'product_id',
                  this.productForm.get('productId').value
                );
                this.productService.uploadImageCall(formData).subscribe(
                  (res) => {
                    this.productForm.reset();
                    this.closeForm.emit(true);
                    temp_i = temp_i + 1;
                    if (temp_i === temp_file_length) {
                      this.ngxLoader.stop();
                      this.toastr.success('Product Updated Successfully.', 'Done.!!');
                    }
                  },
                  (err) => {
                    temp_i = temp_i + 1;
                    if (temp_i === temp_file_length) {
                      this.ngxLoader.stop();
                      this.toastr.error('Something wrong', 'Oops.!!');
                    }
                  }
                );
              }
            } else {
              this.productForm.reset();
              this.toastr.success('Product Updated Successfully.', 'Done.!!');
              this.closeForm.emit(true);
              this.ngxLoader.stop();
            }
          } else {
            this.toastr.error('Something wrong', 'Oops.!!');
            this.ngxLoader.stop();
          }
        },
        (err) => {
          this.toastr.error('Something wrong', 'Oops.!!');
          this.ngxLoader.stop();
        }
      );
  }

  public onImagechange(event): void {
    this.urls = [];
    // let file = event.target.files[0];
    // if (file) {
    //   var mimeType = file.type;
    //   if (mimeType.match(/image\/*/) == null) {
    //     alert('Only images are supported.');
    //     return;
    //   } else {
    //     this.files = file;
    //     let reader = new FileReader();
    //     reader.onload = (e: any) => {
    //       this.urls.push(e.target.result);
    //     };
    //     reader.readAsDataURL(file);
    //   }
    // }
    this.urls = [];
    this.files = event.target.files;
    if (this.files) {
      for (let file of this.files) {
        let reader = new FileReader();
        reader.onload = (e: any) => {
          this.urls.push(e.target.result);
        };
        reader.readAsDataURL(file);
      }
    }

    // console.log("files===>", this.urls);
  }

  public onAddOffer() {
    if (this.offerEdit) {
      this.offerList.forEach((ele) => {
        if (ele.item_id === this.editOfferItemId) {
          (ele.offer_name = this.productForm.get('offerName').value),
            (ele.item_quantity = String(
              this.productForm.get('offerProductQuantity').value
            )),
            (ele.item_unit = this.productForm.get('offerProductUnit').value),
            (ele.item_mrp = String(this.productForm.get('productPrice').value)),
            (ele.max_quantity = String(
              this.productForm.get('max_quantity').value
            )),
            (ele.item_discount_price = String(
              this.productForm.get('discountPrice').value
            )),
            (ele.item_discount_percent =
              this.productForm.get('discountRateUnit').value === '%'
                ? String(this.productForm.get('discountRate').value)
                : ''),
            (ele.item_discount_rupee =
              this.productForm.get('discountRateUnit').value === 'Rs'
                ? String(this.productForm.get('discountRate').value)
                : '');
        }
      });
      this.clearOfferValue();
    } else {
      this.createOfferListArray();
    }
  }

  createOfferListArray() {
    if (
      this.productForm.controls['offerProductQuantity'].valid &&
      this.productForm.controls['productPrice'].valid &&
      this.productForm.controls['offerProductUnit'].valid
    ) {
      let objOffer = {
        offer_name:
          this.productForm.get('offerName').value === null
            ? ''
            : String(this.productForm.get('offerName').value),
        item_quantity: String(
          this.productForm.get('offerProductQuantity').value
        ),
        item_unit: this.productForm.get('offerProductUnit').value,
        item_mrp: String(this.productForm.get('productPrice').value),
        max_quantity: String(this.productForm.get('max_quantity').value),
        item_discount_price: String(
          this.productForm.get('discountPrice').value
        ),
        item_discount_percent:
          this.productForm.get('discountRateUnit').value === '%'
            ? String(this.productForm.get('discountRate').value)
            : '',
        item_discount_rupee:
          this.productForm.get('discountRateUnit').value === 'Rs'
            ? String(this.productForm.get('discountRate').value)
            : '',
      };
      this.offerList.push(objOffer);
      this.clearOfferValue();
    }
  }

  public clearOfferValue(): void {
    this.productForm.patchValue({
      offerName: '',
      offerProductQuantity: '',
      productPrice: 0,
      discountRate: '',
      discountPrice: '',
      max_quantity: '',
    });
    this.offerEdit = false;
  }

  public onRemoveOffer(idx) {
    this.offerList.splice(idx, 1);
    this.productForm.controls['offerList'].patchValue(this.offerList);
  }

  onCategoryChange(idx) {
    this.allSubCategoryList = [];
    if (this.allCategoryList[idx]?.subcategory.length > 1) {
      const tempArrayForAllSubCat = this.allCategoryList[
        idx
      ]?.subcategory.filter(
        ({ subcategory_name }) =>
          subcategory_name.toLowerCase() !==
          this.allCategoryList[idx]?.category_name.toLowerCase()
      );
      this.allSubCategoryList = tempArrayForAllSubCat;
    } else {
      this.productForm.controls['productSubCategory'].patchValue(
        this.allCategoryList[idx]?.subcategory[0].subcategory_id
      );
    }
  }

  public createAddProductPayload() {
    let params;
    if (!this.isEdit) {
      params = {
        product_name: this.productForm.get('productName').value,
        subcategory_id: this.productForm.get('productSubCategory').value,
        product_description:
          this.productForm.get('productDescription').value === null
            ? ''
            : String(this.productForm.get('productDescription').value),
        product_total_quantity: this.productForm.get('productQuantity').value,
        product_total_quantity_unit: this.productForm.get('productUnit').value,
        maker_name: this.productForm.get('maker_name').value,
        productSales: this.offerList,
      };
    } else {
      params = {
        product_id: this.productForm.get('productId').value,
        product_name: this.productForm.get('productName').value,
        subcategory_id: this.productForm.get('productSubCategory').value,
        product_description: this.productForm.get('productDescription').value,
        product_total_quantity: this.productForm.get('productQuantity').value,
        product_total_quantity_unit: this.productForm.get('productUnit').value,
        maker_name: this.productForm.get('maker_name').value,
        product_sales: this.offerList,
      };
    }

    return params;
  }

  patchProductData(data) {
    this.allCategoryList.every((cat, i) => {
      cat.subcategory.every((subcat, i) => {
        if (subcat.subcategory_id === data.subcategory_id) {
          this.productForm.controls['productCategory'].patchValue(i);
          this.allSubCategoryList = cat.subcategory;
          this.productForm.controls['productSubCategory'].patchValue(
            data.subcategory_id
          );
          return false;
        }
        return true;
      });
      return this.productForm.controls['productCategory'].value === ''
        ? true
        : false;
    });

    this.productForm.controls['productId'].patchValue(data.product_id);

    this.productForm.controls['productName'].patchValue(data.product_name);
    this.productForm.controls['productDescription'].patchValue(
      data.product_description
    );
    this.productForm.controls['productQuantity'].patchValue(
      data.product_total_quantity
    );
    this.productForm.controls['productUnit'].patchValue(
      data.product_total_quantity_unit
    );
    this.productForm.controls['maker_name'].patchValue(data.maker_name);
    this.productForm.controls['image'].clearValidators();
    this.productForm.controls['image'].updateValueAndValidity();
    this.urls.push(data.product_image);
    this.offerList = data.product_sales;
  }

  get getSubmitButtonValidation() {
    return (
      this.productForm.controls['productCategory'].invalid ||
      this.productForm.controls['productSubCategory'].invalid ||
      this.productForm.controls['productName'].invalid ||
      this.productForm.controls['productQuantity'].invalid ||
      this.productForm.controls['productUnit'].invalid ||
      this.productForm.controls['image'].invalid ||
      this.offerList.length === 0
    );
  }

  public calcuatediscountPrice() {
    if (
      this.productForm.controls['discountRateUnit'].value ===
      CONSTANT.FOR_DISCOUNT_UNIT[0].value
    ) {
      //Rs Selected
      const result =
        this.productForm.controls['productPrice'].value -
        this.productForm.controls['discountRate'].value;
      this.productForm.controls['discountPrice'].patchValue(result);
    } else {
      const result =
        this.productForm.controls['productPrice'].value -
        (this.productForm.controls['productPrice'].value *
          this.productForm.controls['discountRate'].value) /
          100;
      this.productForm.controls['discountPrice'].patchValue(result);
    }
  }

  public onOfferChangeDetailsClick(item): void {
    this.offerEdit = true;
    this.editOfferItemId = item.item_id;
    this.productForm.patchValue({
      offerName: item.offer_name,
      offerProductQuantity: item.item_quantity,
      offerProductUnit: item.item_unit,
      productPrice: item.item_mrp,
      max_quantity: item.max_quantity,
      discountPrice: item.item_discount_price,
      discountRateUnit:
        item.item_discount_percent === '' && item.item_discount_rupee === ''
          ? ''
          : item.item_discount_percent !== ''
          ? '%'
          : 'Rs',
      discountRate:
        item.item_discount_percent !== ''
          ? item.item_discount_percent
          : item.item_discount_rupee,
    });
  }
}
