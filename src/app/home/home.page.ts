import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {FireServService, ProductItem} from "../fire-serv.service";
import {AlertController, LoadingController, NavController, ToastController} from "@ionic/angular";
import {AngularFirestore} from '@angular/fire/firestore';
import {AngularFireAuth} from '@angular/fire/auth';

@Component({
    selector: 'app-home',
    templateUrl: 'home.page.html',
    styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
    dat = new Date();
    dateNow = this.dat.getFullYear() + '-' + (this.dat.getMonth() + 1) + '-' + this.dat.getDate();

    postProduct: ProductItem = {
        itemQuantity: 0,
        itemType: '',
        itemName: '',
        itemPrice: 0,
        itemDate: this.dateNow,
        userId: '',
        paymentMethod: '',

    };

    currNumber = null;
    iType: string;
    iName: string;
    iPrice: number;
    pMethod: string;
    userID: string;

    cash = 0;

    productId = null;
    loginUserName = null;
    loginUserRole = null;
    isLogin: boolean = false;

    constructor(private rooter: ActivatedRoute, public fireServ: FireServService,
                private loadn: LoadingController, private nav: NavController,
                private loadCtrl: LoadingController, private router: Router,
                private firestore: AngularFirestore,
                private fireAuth: AngularFireAuth,
                private alertCtrl: AlertController, private toastCtrl: ToastController) {

    }

    ngOnInit() {
        console.log(this.dateNow);
        this.fireAuth.authState.subscribe(
            value => {
                if (value !== null) {
                    this.isLogin = true;
                    this.userID = value.uid;
                    this.firestore.collection('users')
                        .doc(value.email)
                        .get()
                        .subscribe(ui => {
                            this.loginUserName = ui.get('userName');
                            this.loginUserRole = ui.get('role');
                            console.log(this.loginUserRole);
                        }, error1 => {
                            console.log(error1);
                        })
                } else {
                    this.router.navigateByUrl('').catch(reason => {
                        console.log(reason)
                    });
                    this.isLogin = false;
                }
            },
            error1 => {
                console.log(error1);
                this.isLogin = false;
                this.router.navigateByUrl('login').catch(reason => {
                    console.log(reason);
                })
            }
        );

        // if (this.fireServ.currentUserId) {
        //
        // }
        // this.productId = this.rooter.snapshot.params['id'];
        // if (this.productId) {
        //     this.loadProduct()
        //
        // }
        // this.fireServ.userNAME();
        // // this.firestore.collection('users')
        // //     .ref.where('userId', '==', this.fireServ.currentUserId).get().then(value => {
        // //     value.forEach(result => {
        // //         this.cash = result.get('itemPrice');
        // //         console.log(this.cash)
        // //     });
        // //
        // // })
    }

    async loadProduct() {
        const loading = await this.loadn.create({
            message: 'Loading Product'
        });
        await loading.present();

        this.fireServ.getProductItem(this.productId)
            .subscribe(res => {
                loading.dismiss();
                this.postProduct = res;
            });
    }

    async saveProduct() {
        if (this.iType != null || this.currNumber != null) {
            if (this.pMethod != null) {
                this.postProduct.itemName = this.iName;
                this.postProduct.paymentMethod = this.pMethod;
                this.postProduct.itemPrice = this.iPrice;
                this.postProduct.itemQuantity = this.currNumber;
                this.postProduct.itemType = this.iType;
                this.postProduct.userId = this.fireServ.currentUserId;
                const loading = await this.loadn.create({
                    message: 'Salling...'
                });
                await loading.present();

                if (this.productId) {

                } else {
                    this.fireServ.addProductItem(this.postProduct).then(() => {
                        loading.dismiss();
                        this.showAlert();
                        this.currNumber = null;
                        this.iPrice = null;
                        this.iType = null;
                        this.pMethod = null;
                        this.iName = null;
                    })
                }
            } else {
                this.showToast2()
            }
        } else {
            this.showToast()
        }
        console.log(this.fireServ.currentUserName);

    }

    getPrice(qnt: number) {
        if (this.iType === 'Plain') {
            // this.currNumber.set(qnt);
            this.iPrice = 2000 * this.currNumber;

        } else if (this.iType === 'WakandaMix') {
            // this.currNumber.set(qnt);
            this.iPrice = 3000 * this.currNumber;
        }
    }

    decrement() {
        if (this.currNumber > 0) {
            const nw = this.currNumber--;
            this.getPrice(nw);
        }
    }

    increment() {
        const nw = this.currNumber++;
        this.getPrice(nw)
    }

    async logout() {
        this.fireServ.signOut();
        const loading = await this.loadCtrl.create({
            spinner: 'hide',
            message: 'Signing out..'
        });
        await loading.present();
        if (!this.fireServ.currentUserId) {
            loading.dismiss();
        }
    }

    sales() {
        this.router.navigateByUrl('display')
    }

    async showAlert() {
        const alet = await this.alertCtrl.create({
            message: this.iType,
            subHeader: 'Solid',
        });
        await alet.present();

    }

    async showToast() {
        const toss = await this.toastCtrl.create({
            message: 'Select Product Type',
            duration: 3000,
        });
        await toss.present();
    }

    async showToast2() {
        const toss = await this.toastCtrl.create({
            message: 'Select Payment Method',
            duration: 3000,
        });
        await toss.present();
    }

    updatePlainPrice() {
        this.iPrice = 2000 * this.currNumber;
    }

    updateMixPrice() {
        this.iPrice = 3000 * this.currNumber;
    }

}
