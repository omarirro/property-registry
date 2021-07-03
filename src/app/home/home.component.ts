import { Component, OnInit } from "@angular/core";
import { LocationStrategy, PlatformLocation, Location } from "@angular/common";
import { LegendItem, ChartType } from "../lbd/lbd-chart/lbd-chart.component";
import * as Chartist from "chartist";
import { EthcontractService } from "app/services/ethcontract.service";

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.css"],
})
export class HomeComponent implements OnInit {

  private properties : any;

  constructor(
    public location: Location,
    private ethcontractService: EthcontractService
  ) {}

  ngOnInit() {
    this.ethcontractService.getAccountInfo().then((acctInfo : any) => {
      console.log(acctInfo.fromAccount);
      this.ethcontractService
        .getProperts(acctInfo.fromAccount, acctInfo.fromAccount)
        .then((data) => {
          this.properties = data;
          console.log(this.properties);
        });
    });
  }
}
