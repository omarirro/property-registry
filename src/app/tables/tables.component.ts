import { Component, OnInit } from "@angular/core";
import { NavigationExtras, Router } from "@angular/router";
import { EthcontractService } from "app/services/ethcontract.service";

declare interface TableData {
  headerRow: string[];
  dataRows: string[][];
}

@Component({
  selector: "app-tables",
  templateUrl: "./tables.component.html",
  styleUrls: ["./tables.component.css"],
})
export class TablesComponent implements OnInit {
  public tableData1: TableData;

  public id: number = 1;

  public contracts = [];

  constructor(
    private ethcontractService: EthcontractService,
    private router: Router
  ) {}

  ngOnInit() {
    this.tableData1 = {
      headerRow: ["ID", "Type", "Property #", "Details"],
      dataRows: this.contracts,
    };
    this.ethcontractService.getAccountInfo().then(async (acctInfo: any) => {
      await this.ethcontractService
        .getContracts(acctInfo.fromAccount)
        .then(async (arr: any) => {
          for (let i = 0; i < arr.length; i++) {
            let contract = new Map();
            const element = arr[i];
            contract.set("contractAddr", element);
            contract.set("id", i.toString());
            await this.ethcontractService
              .contractType(element, acctInfo.fromAccount)
              .then(async (data) => {
                if (data != 0) {
                  let propertyId;
                  await this.ethcontractService
                    .getPropertyIdFromContract(element)
                    .then((id) => {
                      propertyId = id;
                    });
                  switch (data) {
                    case 1:
                      contract.set("type", "Buyer");
                      break;
                    case 2:
                      contract.set("type", "Seller");
                      break;
                    case 3:
                      contract.set("type", "Notary");
                      break;
                    default:
                      break;
                  }
                  contract.set("propid", propertyId);
                }
              });

            this.contracts.push(contract);
          }
        });
    });
  }

  seeDetails(index) {
    let cntrct = this.contracts[index];
    let navigationExtras: NavigationExtras = {
      queryParams: {
        address: cntrct.get("contractAddr"),
        type: cntrct.get("type"),
        propertyId: cntrct.get("propid") 
      },
    };
    this.router.navigate(["contract"], navigationExtras);
  }
}
