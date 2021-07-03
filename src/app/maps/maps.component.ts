import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { EthcontractService } from "app/services/ethcontract.service";

@Component({
  selector: "app-maps",
  templateUrl: "./maps.component.html",
  styleUrls: ["./maps.component.css"],
})
export class MapsComponent implements OnInit {
  public address : string;
  public ptype : string;
  public propid : string;

  public contState : number;

  constructor(private route: ActivatedRoute, private ethcontractService: EthcontractService) {}

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.address = params.address;
      this.ptype = params.type;
      this.propid = params.propid;
    });

    this.contractState();
  }

  async contractState(){
    await this.ethcontractService.getContractState(this.address).then((state: number) => {
      this.contState = state;
    })
  }

}
